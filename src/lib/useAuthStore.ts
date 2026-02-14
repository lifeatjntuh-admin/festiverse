import { create } from 'zustand'
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User
} from 'firebase/auth'
import { auth } from './firebase'
import { supabase } from './supabase'
import { Profile, UserRole } from '@/types/database'
import toast from 'react-hot-toast'

interface AuthState {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    initialized: boolean

    // Auth Actions
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    deleteAccount: () => Promise<void>

    // Role Actions (User)
    requestRole: (role: UserRole) => Promise<void>
    cancelRoleRequest: () => Promise<void>

    // Admin Actions
    manageRole: (userId: string, role: UserRole, action: 'add' | 'remove') => Promise<void>
    approveRoleRequest: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    initialized: false,

    signInWithGoogle: async () => {
        set({ isLoading: true })
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            // Profile sync happens in onAuthStateChanged
        } catch (error) {
            console.error('Sign in error:', error)
            toast.error('Failed to sign in')
            set({ isLoading: false })
            throw error
        }
    },

    signOut: async () => {
        set({ isLoading: true })
        try {
            await firebaseSignOut(auth)
            set({ user: null, profile: null, isLoading: false })
        } catch (error) {
            console.error('Sign out error:', error)
            toast.error('Failed to sign out')
            set({ isLoading: false })
        }
    },

    deleteAccount: async () => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true })
        try {
            // Soft delete in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', user.uid)

            if (error) throw error

            await get().signOut()
            toast.success('Account deleted successfully')
        } catch (error) {
            console.error('Delete account error:', error)
            toast.error('Failed to delete account')
            set({ isLoading: false })
            throw error
        }
    },

    requestRole: async (role: UserRole) => {
        const { user, profile } = get()
        if (!user || !profile) return

        try {
            // Optimistic update
            set({ profile: { ...profile, role_request: role } })

            const { error } = await supabase
                .from('profiles')
                .update({ role_request: role })
                .eq('id', user.uid)

            if (error) {
                // Revert optimistic update
                set({ profile: { ...profile, role_request: null } })
                throw error
            }
            toast.success('Role requested successfully')
        } catch (error) {
            console.error('Request role error:', error)
            toast.error('Failed to request role')
        }
    },

    cancelRoleRequest: async () => {
        const { user, profile } = get()
        if (!user || !profile) return

        const previousRequest = profile.role_request
        try {
            // Optimistic update
            set({ profile: { ...profile, role_request: null } })

            const { error } = await supabase
                .from('profiles')
                .update({ role_request: null })
                .eq('id', user.uid)

            if (error) {
                // Revert
                set({ profile: { ...profile, role_request: previousRequest } })
                throw error
            }
            toast.success('Request cancelled')
        } catch (error) {
            console.error('Cancel request error:', error)
            toast.error('Failed to cancel request')
        }
    },

    manageRole: async (userId: string, role: UserRole, action: 'add' | 'remove') => {
        const { user, profile } = get()

        if (!user || !profile || (!profile.roles.includes('super_admin') && !profile.roles.includes('app_admin'))) {
            throw new Error('Unauthorized')
        }

        try {
            const { error } = await supabase.rpc('manage_role', {
                executor_id: user.uid,
                target_user_id: userId,
                role_to_manage: role,
                action_type: action
            })

            if (error) throw error
            toast.success(`Role ${action === 'add' ? 'added' : 'removed'} successfully`)

            // Optimistic update if modifying self (unlikely but possible)
            if (userId === user.uid) {
                const newRoles = action === 'add'
                    ? [...profile.roles, role]
                    : profile.roles.filter(r => r !== role)
                set({ profile: { ...profile, roles: newRoles } })
            }
        } catch (err) {
            console.error('Failed to manage role:', err)
            toast.error('Failed to update role')
            throw err
        }
    },

    approveRoleRequest: async (userId: string) => {
        const { user, profile } = get()
        if (!user || !profile || (!profile.roles.includes('super_admin') && !profile.roles.includes('app_admin'))) {
            throw new Error('Unauthorized')
        }

        try {
            const { error } = await supabase.rpc('approve_role_request', {
                executor_id: user.uid,
                target_user_id: userId
            })

            if (error) throw error
            toast.success('Role request approved')
        } catch (err) {
            console.error('Failed to approve request:', err)
            toast.error('Failed to approve request')
            throw err
        }
    }
}))

// Helper: Sync Profile logic
async function syncProfile(firebaseUser: User, retries = 3): Promise<void> {
    const { uid, email, displayName, photoURL } = firebaseUser

    for (let i = 0; i < retries; i++) {
        try {
            // 1. Check if profile exists
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('id, is_deleted, roles')
                .eq('id', uid)
                .maybeSingle()

            if (fetchError) throw fetchError

            // 2. Reactivate if soft-deleted
            if (existingProfile?.is_deleted) {
                await supabase.from('profiles').update({
                    is_deleted: false,
                    deleted_at: null
                }).eq('id', uid)
                toast.success('Welcome back! Your account has been reactivated.')
            }

            // 3. Determine Roles
            let roles: UserRole[] = ['attendee']
            if (existingProfile?.roles && existingProfile.roles.length > 0) {
                roles = existingProfile.roles as UserRole[]
            } else {
                // Check if any Super Admin exists
                const { count, error: countError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .contains('roles', ['super_admin'])

                if (!countError && count === 0) {
                    roles = ['super_admin', 'attendee']
                    console.log('🎉 First user detected! Promoting to Super Admin.')
                }
            }

            const payload = {
                email: email || '',
                name: displayName || email?.split('@')[0] || 'User',
                avatar_url: photoURL || null,
                is_deleted: false,
                deleted_at: null,
                roles: roles,
            }

            // Upsert profile
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({ id: uid, ...payload, updated_at: new Date().toISOString() })

            if (upsertError) throw upsertError

            if (!existingProfile && roles.includes('super_admin')) {
                toast('You are the first user! You are now Super Admin 👑', { duration: 6000 })
            }

            return // Success
        } catch (err: any) {
            // Don't retry if request was aborted
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) {
                throw err
            }

            console.warn(`Sync attempt ${i + 1} failed:`, err)
            if (i === retries - 1) throw err // Throw on last attempt
            // Wait before retry (exponential backoff: 500, 1000, 2000)
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)))
        }
    }
}

// Initialize Auth Listener
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        try {
            await syncProfile(firebaseUser)



            // Fetch full profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single()

            if (error) throw error

            useAuthStore.setState({
                user: firebaseUser,
                profile: profile as Profile,
                isLoading: false,
                initialized: true
            })
        } catch (error: any) {
            const isAbort = error?.name === 'AbortError' ||
                error?.message?.includes('AbortError') ||
                error?.message?.includes('signal is aborted without reason')

            if (isAbort) {
                console.warn('Profile sync aborted (likely due to page navigation or duplicate request). Ignoring.')
                return
            }

            console.error('Profile sync failed:', error)
            if (error?.message) console.error('Error message:', error.message)
            if (error?.details) console.error('Error details:', error.details)
            if (error?.hint) console.error('Error hint:', error.hint)

            toast.error(`Failed to load profile: ${error?.message || 'Unknown error'}`)

            // Sign out if sync fails (unless it's a transient network error that we already retried)
            // But if we are here, retries failed.
            await firebaseSignOut(auth)
            useAuthStore.setState({ user: null, profile: null, isLoading: false, initialized: true })
        }
    } else {
        useAuthStore.setState({ user: null, profile: null, isLoading: false, initialized: true })
    }
})
