import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/useAuthStore'
import { Profile, UserRole } from '@/types/database'
import RoleBadge from '@/components/admin/RoleBadge'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
    const [editingUser, setEditingUser] = useState<string | null>(null)

    const stats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.roles?.some(r => ['super_admin', 'app_admin'].includes(r))).length
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesRole = roleFilter === 'all' || (user.roles || []).includes(roleFilter)
        return matchesSearch && matchesRole
    })

    // Redirect if not admin
    useEffect(() => {
        if (profile) {
            // Check if user has any admin role
            const hasAdminRole = profile.roles?.some(r => ['super_admin', 'app_admin'].includes(r))

            if (!hasAdminRole) {
                toast.error(t('admin.unauthorized'))
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
            toast.error(t('admin.failedLoadUsers'))
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
        return <div className="p-8 text-center">{t('admin.loading')}</div>
    }

    // Role helpers
    const availableRoles: UserRole[] = ['super_admin', 'app_admin', 'event_manager', 'stall_manager', 'team_member', 'attendee']

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 animate-fade-in relative">
            <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-4 py-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors">
                    <Icon icon="solar:arrow-left-linear" width={24} className="text-gray-600 dark:text-foreground" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-foreground">{t('admin.title')}</h1>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{t('admin.manageUsers')}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2">
                            <Icon icon="solar:users-group-rounded-bold" width={20} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.totalUsers}</div>
                        <div className="text-xs text-gray-500 dark:text-muted-foreground font-medium uppercase tracking-wide">{t('admin.totalUsers')}</div>
                    </div>
                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2">
                            <Icon icon="solar:shield-user-bold" width={20} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.totalAdmins}</div>
                        <div className="text-xs text-gray-500 dark:text-muted-foreground font-medium uppercase tracking-wide">{t('admin.admins')}</div>
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 dark:text-foreground">{t('admin.userManagement')}</h2>
                        <button className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">{t('admin.exportCSV')}</button>
                    </div>

                    {/* Search & Filter */}
                    <div className="p-4 border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-muted/10 space-y-3">
                        <div className="relative">
                            <Icon icon="solar:magnifer-linear" className="absolute left-3 top-2.5 text-gray-400 dark:text-muted-foreground" width={18} />
                            <input
                                type="text"
                                placeholder={t('admin.searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-foreground"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Role Filter Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => setRoleFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${roleFilter === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white' : 'bg-white dark:bg-card text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600'}`}
                            >
                                {t('admin.allUsers')}
                            </button>
                            {availableRoles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border capitalize ${roleFilter === role ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white' : 'bg-white dark:bg-card text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    {role.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-border">
                        {filteredUsers.map((user) => {
                            return (
                                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors">
                                    {/* User Info */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-muted flex-shrink-0 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-muted-foreground font-bold">
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="font-medium text-gray-900 dark:text-card-foreground truncate">
                                                    {user.name}
                                                </div>

                                                {/* Edit Trigger */}
                                                <button
                                                    onClick={() => setEditingUser(user.id)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-muted rounded text-gray-400 dark:text-muted-foreground transition-colors"
                                                >
                                                    <Icon icon="solar:pen-new-square-linear" width={20} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {/* Active Roles */}
                                                {(user.roles || []).map(r => (
                                                    <RoleBadge key={r} role={r} />
                                                ))}

                                                {/* Role Request */}
                                                {user.role_request && (
                                                    <button
                                                        onClick={() => handleApproveRequest(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="flex items-center gap-1 text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/20 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === user.id ? <Icon icon="solar:spinner-linear" className="animate-spin" /> : <Icon icon="solar:check-circle-bold" />}
                                                        Approve: {user.role_request}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-muted-foreground break-all">{user.email}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-muted-foreground/70 mt-1">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Role Management Modal */}
            {editingUser && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-xs" onClick={() => setEditingUser(null)} />

                    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {(() => {
                            const user = users.find(u => u.id === editingUser)
                            if (!user) return null

                            return (
                                <>
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-muted/20">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-foreground">Manage Roles</h3>
                                            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors flex-shrink-0 ml-2">
                                            <Icon icon="solar:close-circle-linear" width={22} className="text-gray-500 dark:text-muted-foreground" />
                                        </button>
                                    </div>

                                    <div className="p-2 max-h-[60vh] overflow-y-auto">
                                        <div className="space-y-1">
                                            {availableRoles.map((role) => {
                                                const hasRole = (user.roles || []).includes(role)
                                                const isLoading = actionLoading === user.id

                                                return (
                                                    <button
                                                        key={role}
                                                        disabled={isLoading}
                                                        onClick={() => handleManageRole(user.id, role, hasRole ? 'remove' : 'add')}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${hasRole
                                                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                                                            : 'hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-foreground'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${hasRole
                                                                ? 'bg-primary-600 border-primary-600 text-white'
                                                                : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                                                }`}>
                                                                {hasRole && <Icon icon="solar:check-read-linear" width={14} />}
                                                            </div>
                                                            <span className="capitalize">{role.replace('_', ' ')}</span>
                                                        </div>
                                                        {isLoading && <Icon icon="solar:spinner-linear" className="animate-spin text-gray-400" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 border-t border-gray-100 dark:border-border bg-gray-50/30 dark:bg-muted/10 text-center">
                                        <p className="text-[10px] text-gray-400 dark:text-muted-foreground">
                                            Tap to toggle roles. Changes are saved immediately.
                                        </p>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>,
                document.body
            )}
        </div >
    )
}
