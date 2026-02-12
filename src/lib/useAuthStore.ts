import { create } from 'zustand'
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    type User,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { supabase } from './supabase'
import type { Profile } from '@/types/database'
import toast from 'react-hot-toast'

interface AuthState {
    // State
    user: User | null
    profile: Profile | null
    isLoading: boolean
    isInitialized: boolean
    error: string | null

    // Actions
    initialize: () => () => void
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
    deleteAccount: () => Promise<void>
    clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    user: null,
    profile: null,
    isLoading: true,
    isInitialized: false,
    error: null,

    // Initialize auth listener — returns unsubscribe function
    initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                set({ user: firebaseUser, isLoading: true })

                // Sync/fetch profile from Supabase
                try {
                    await syncProfile(firebaseUser)
                    const profile = await fetchProfile(firebaseUser.uid)
                    set({ profile, isLoading: false, isInitialized: true })
                } catch (err) {
                    console.error('Failed to sync profile:', err)
                    set({
                        profile: null,
                        isLoading: false,
                        isInitialized: true,
                        error: 'Failed to load profile',
                    })
                }
            } else {
                set({
                    user: null,
                    profile: null,
                    isLoading: false,
                    isInitialized: true,
                })
            }
        })

        return unsubscribe
    },

    // Google Sign-In via Firebase
    signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
            await signInWithPopup(auth, googleProvider)
            // onAuthStateChanged will handle the rest
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Sign-in failed'
            set({ isLoading: false, error: message })
            throw err
        }
    },

    // Sign Out
    signOut: async () => {
        set({ isLoading: true, error: null })
        try {
            await firebaseSignOut(auth)
            set({ user: null, profile: null, isLoading: false })
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Sign-out failed'
            set({ isLoading: false, error: message })
        }
    },

    // Update profile in Supabase
    updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get()
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.uid)
                .select()
                .single()

            if (error) throw error
            set({ profile: data as Profile })
        } catch (err) {
            console.error('Failed to update profile:', err)
            throw err
        }
    },

    // Soft-delete account (flag in Supabase + sign out Firebase)
    deleteAccount: async () => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })
        try {
            // Flag as deleted in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({ is_deleted: true, deleted_at: new Date().toISOString() })
                .eq('id', user.uid)

            if (error) throw error

            // Sign out of Firebase
            await firebaseSignOut(auth)
            set({ user: null, profile: null, isLoading: false })
        } catch (err) {
            console.error('Failed to delete account:', err)
            set({ isLoading: false, error: 'Failed to delete account' })
            throw err
        }
    },

    clearError: () => set({ error: null }),
}))

// ===== Helper Functions =====

/**
 * Sync Firebase user data to Supabase profiles table.
 * Uses upsert to create on first login, update on subsequent logins.
 */
async function syncProfile(firebaseUser: User): Promise<void> {
    const { uid, email, displayName, photoURL } = firebaseUser

    // 1. Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, is_deleted')
        .eq('id', uid)
        .maybeSingle()

    if (fetchError) {
        console.error('Error checking profile existence:', fetchError)
        throw fetchError
    }

    const payload = {
        email: email || '',
        name: displayName || email?.split('@')[0] || 'User',
        avatar_url: photoURL || null,
        is_deleted: false,
        deleted_at: null,
    }

    if (existingProfile) {
        // Check if account was previously deleted
        const wasDeleted = existingProfile.is_deleted

        // 2. Update existing profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', uid)

        if (updateError) {
            console.error('Error updating profile:', updateError)
            throw updateError
        }

        if (wasDeleted) {
            toast.success('Welcome back! Your account has been recovered.', {
                icon: '♻️',
                duration: 5000,
            })
        }
    } else {
        // 3. Create new profile
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: uid,
                ...payload,
            })

        if (insertError) {
            console.error('Error creating profile:', insertError)
            throw insertError
        }
    }
}

/**
 * Fetch the full profile from Supabase.
 */
async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Profile fetch error:', error)
        return null
    }

    return data as Profile
}
