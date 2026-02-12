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

    clearError: () => set({ error: null }),
}))

// ===== Helper Functions =====

/**
 * Sync Firebase user data to Supabase profiles table.
 * Uses upsert to create on first login, update on subsequent logins.
 */
async function syncProfile(firebaseUser: User): Promise<void> {
    const { error } = await supabase.from('profiles').upsert(
        {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name:
                firebaseUser.displayName ||
                firebaseUser.email?.split('@')[0] ||
                'User',
            avatar_url: firebaseUser.photoURL || null,
        },
        { onConflict: 'id' }
    )

    if (error) {
        console.error('Profile sync error:', error)
        throw error
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
