import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/useAuthStore'
import { Profile, UserRole } from '@/types/database'
import RoleBadge from '@/components/admin/RoleBadge'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Redirect if not admin
    useEffect(() => {
        if (profile) {
            // Check if user has any admin role
            const hasAdminRole = profile.roles?.some(r => ['super_admin', 'app_admin'].includes(r))

            if (!hasAdminRole) {
                toast.error('Unauthorized access')
                navigate('/')
            }
        }
    }, [profile, navigate])

    // Fetch all users
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50) // Pagination later

        if (error) {
            toast.error('Failed to load users')
        } else {
            setUsers(data as Profile[])
        }
        setLoading(false)
    }

    const handleManageRole = async (userId: string, role: UserRole, action: 'add' | 'remove') => {
        if (!confirm(`Are you sure you want to ${action} ${role} for this user?`)) return

        setActionLoading(userId)
        try {
            await useAuthStore.getState().manageRole(userId, role, action)
            // Optimistic update
            setUsers(users.map(u => {
                if (u.id !== userId) return u
                const currentRoles = u.roles || []
                const newRoles = action === 'add'
                    ? [...new Set([...currentRoles, role])]
                    : currentRoles.filter(r => r !== role)
                return { ...u, roles: newRoles }
            }))
        } catch (error) {
            // Error handled in store
        } finally {
            setActionLoading(null)
        }
    }

    const handleApproveRequest = async (userId: string) => {
        if (!confirm('Approve this role request?')) return

        setActionLoading(userId)
        try {
            await useAuthStore.getState().approveRoleRequest(userId)
            // Optimistic update
            setUsers(users.map(u => {
                if (u.id !== userId) return u
                const newRole = u.role_request!
                const currentRoles = u.roles || []
                return {
                    ...u,
                    roles: [...new Set([...currentRoles, newRole])],
                    role_request: null
                }
            }))
        } catch (error) {
            // Error handled in store
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading Admin Dashboard...</div>
    }

    // Role helpers
    const availableRoles: UserRole[] = ['team_member', 'stall_manager', 'event_manager', 'app_admin', 'super_admin']

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-4 py-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
                <Link to="/profile" className="p-2 hover:bg-gray-100 dark:hover:bg-muted/50 rounded-full transition-colors">
                    <Icon icon="solar:arrow-left-linear" width={24} className="text-gray-900 dark:text-foreground" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-foreground">Admin Dashboard</h1>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Manage users and roles</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-w-4xl mx-auto space-y-6">

                {/* Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border shadow-sm">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{users.length}</div>
                        <div className="text-xs text-gray-400 dark:text-muted-foreground font-medium uppercase">Total Users</div>
                    </div>
                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border shadow-sm">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {users.filter(u => (u.roles || []).some(r => ['super_admin', 'app_admin'].includes(r))).length}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-muted-foreground font-medium uppercase">Admins</div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-muted/20 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-card-foreground">Recent Users</h3>
                        <button onClick={fetchUsers} className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 p-1.5 rounded-lg transition-colors">
                            <Icon icon="solar:refresh-linear" width={20} />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {users.map((user) => {
                            const userRoles = user.roles || []
                            return (
                                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors">
                                    {/* User Info */}
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-muted flex-shrink-0 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-muted-foreground font-bold">
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-card-foreground flex items-center gap-2 mb-1">
                                                {user.name}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {/* Active Roles */}
                                                {(user.roles || []).map(r => (
                                                    <div key={r} className="group relative">
                                                        <RoleBadge role={r} />
                                                        {/* Remove Role Button (only if admin) */}
                                                        {(profile?.roles?.includes('super_admin') || (profile?.roles?.includes('app_admin') && r !== 'super_admin')) && r !== 'attendee' && (
                                                            <button
                                                                onClick={() => handleManageRole(user.id, r, 'remove')}
                                                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pb-0.5"
                                                            >
                                                                &times;
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Role Request */}
                                                {user.role_request && (
                                                    <button
                                                        onClick={() => handleApproveRequest(user.id)}
                                                        className="flex items-center gap-1 text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/20 px-2 py-0.5 rounded-full transition-colors"
                                                    >
                                                        <Icon icon="solar:check-circle-bold" />
                                                        Approve: {user.role_request}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-muted-foreground break-all">{user.email}</div>
                                        </div>
                                    </div>

                                    {/* Actions: Add Role */}
                                    {
                                        (profile?.roles?.includes('super_admin') || profile?.roles?.includes('app_admin')) && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    disabled={actionLoading === user.id}
                                                    value=""
                                                    onChange={(e) => {
                                                        if (e.target.value) handleManageRole(user.id, e.target.value as UserRole, 'add')
                                                        e.target.value = '' // Reset the select after selection
                                                    }}
                                                    className="text-xs border border-gray-200 dark:border-border rounded-lg px-2 py-1.5 bg-white dark:bg-background text-gray-700 dark:text-foreground focus:ring-2 focus:ring-primary-500 outline-none w-32"
                                                >
                                                    <option value="">+ Add Role</option>
                                                    {availableRoles.filter(r => !userRoles.includes(r)).map(r => {
                                                        // Hide super_admin option for app_admins
                                                        if (r === 'super_admin' && !profile.roles.includes('super_admin')) return null
                                                        return <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                                    })}
                                                </select>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div >
    )
}
