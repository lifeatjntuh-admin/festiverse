import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/useAuthStore'
import {
    useAllEvents,
    useStalls,
    useSearchProfiles,
    transferEventOwnership,
    transferStallOwnership
} from '@/lib/useData'
import { useFormStore } from '@/lib/useFormStore'
import { Profile, UserRole } from '@/types/database'
import RoleBadge from '@/components/admin/RoleBadge'
import AppSettingsDialog from '@/components/admin/AppSettingsDialog'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
    // Tab State
    const [activeTab, setActiveTab] = useState<'users' | 'events' | 'stalls'>('users')

    // Data for other tabs
    const { events, loading: eventsLoading, refresh: refreshEvents, setEvents } = useAllEvents()
    const { stalls, loading: stallsLoading, refresh: refreshStalls, setStalls } = useStalls()

    // Transfer State
    const [transferTarget, setTransferTarget] = useState<{ type: 'event' | 'stall', id: string, name: string, currentOwnerId: string } | null>(null)
    const [transferSearchQuery, setTransferSearchQuery] = useState('')
    const { profiles: transferSearchResults, loading: transferSearchLoading } = useSearchProfiles(transferSearchQuery)
    const [newOwner, setNewOwner] = useState<Profile | null>(null)
    const [oldOwnerStatus, setOldOwnerStatus] = useState<'leave' | 'member' | 'co_host'>('leave')

    const { t } = useTranslation()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)
    const { openForm } = useFormStore()

    const stats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.roles?.some(r => ['super_admin', 'app_admin'].includes(r))).length,
        totalEvents: events.length,
        totalStalls: stalls.length
    }

    // ... (rest of existing user fetching logic) ... 
    // Re-paste this part carefully or assume it's there? Detailed replacement below.

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesRole = roleFilter === 'all' || (user.roles || []).includes(roleFilter)
        return matchesSearch && matchesRole
    })

    // Redirect if not admin
    useEffect(() => {
        if (profile) {
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
            .limit(50)

        if (error) {
            toast.error(t('admin.failedLoadUsers'))
        } else {
            setUsers(data as Profile[])
        }
        setLoading(false)
    }

    const handleManageRole = async (userId: string, role: UserRole, action: 'add' | 'remove') => {
        if (!confirm(t('admin.confirmManageRole', { action, role }))) return

        setActionLoading(userId)
        try {
            await useAuthStore.getState().manageRole(userId, role, action)
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
        if (!confirm(t('admin.confirmApproveRequest'))) return

        setActionLoading(userId)
        try {
            await useAuthStore.getState().approveRoleRequest(userId)
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

    const handleTransfer = async () => {
        if (!transferTarget || !newOwner) return

        const confirmMsg = `Are you sure you want to transfer ownership of "${transferTarget.name}" to ${newOwner.name}?`
        if (!confirm(confirmMsg)) return

        setActionLoading('transfer')
        let result

        if (transferTarget.type === 'event') {
            result = await transferEventOwnership(transferTarget.id, newOwner.id, oldOwnerStatus)
        } else {
            result = await transferStallOwnership(transferTarget.id, newOwner.id, oldOwnerStatus)
        }

        if (result.error) {
            toast.error(`Transfer failed: ${result.error.message}`)
        } else {
            toast.success('Ownership transferred successfully!')

            // Optimistic Update
            if (transferTarget.type === 'event' && newOwner) {
                setEvents((prev) => prev.map(e =>
                    e.id === transferTarget.id
                        ? { ...e, organizer: newOwner, organizer_id: newOwner.id }
                        : e
                ))
            } else if (transferTarget.type === 'stall' && newOwner) {
                setStalls((prev) => prev.map(s =>
                    s.id === transferTarget.id
                        ? { ...s, owner: newOwner, owner_id: newOwner.id }
                        : s
                ))
            }



            setTransferTarget(null)
            setNewOwner(null)
            setTransferSearchQuery('')

            // Refresh in background
            if (transferTarget.type === 'event') refreshEvents()
            else refreshStalls()
        }
        setActionLoading(null)
    }

    if (loading && activeTab === 'users') {
        return <div className="p-8 text-center">{t('admin.loading')}</div>
    }
    if (eventsLoading && activeTab === 'events') {
        return <div className="p-8 text-center"><Icon icon="solar:spinner-linear" className="animate-spin inline mr-2" />Loading events...</div>
    }
    if (stallsLoading && activeTab === 'stalls') {
        return <div className="p-8 text-center"><Icon icon="solar:spinner-linear" className="animate-spin inline mr-2" />Loading stalls...</div>
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
                <button onClick={() => setShowSettingsDialog(true)} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors">
                    <Icon icon="solar:settings-bold" />
                    App Settings
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border bg-white dark:bg-card sticky top-[73px] z-10">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'users' ? 'text-primary-600 border-primary-500' : 'text-gray-500 dark:text-muted-foreground border-transparent'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'events' ? 'text-primary-600 border-primary-500' : 'text-gray-500 dark:text-muted-foreground border-transparent'}`}
                >
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('stalls')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'stalls' ? 'text-primary-600 border-primary-500' : 'text-gray-500 dark:text-muted-foreground border-transparent'}`}
                >
                    Stalls
                </button>
            </div>

            {/* Content */}
            <div className="p-4 max-w-4xl mx-auto space-y-6">

                {/* Stats row changes based on tab? Or keep generic? Keeping generic top stats */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-white dark:bg-card p-2 rounded-xl border border-gray-100 dark:border-border shadow-sm text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.totalUsers}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Users</div>
                    </div>
                    <div className="bg-white dark:bg-card p-2 rounded-xl border border-gray-100 dark:border-border shadow-sm text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.totalAdmins}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Admins</div>
                    </div>
                    <div className="bg-white dark:bg-card p-2 rounded-xl border border-gray-100 dark:border-border shadow-sm text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.totalEvents}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Events</div>
                    </div>
                    <div className="bg-white dark:bg-card p-2 rounded-xl border border-gray-100 dark:border-border shadow-sm text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.totalStalls}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Stalls</div>
                    </div>
                </div>

                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
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
                )}

                {activeTab === 'events' && (
                    <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100 dark:divide-border">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors">
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-foreground truncate">{event.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 flex items-center gap-2">
                                            <span>{new Date(event.start_time).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className={`font-medium ${!event.organizer ? 'text-red-500' : ''}`}>
                                                {event.organizer?.name || 'Unknown Organizer'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openForm('event', event, refreshEvents)}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg transition-colors"
                                            title="Edit Event"
                                        >
                                            <Icon icon="solar:pen-new-square-linear" width={16} />
                                        </button>
                                        <button
                                            onClick={() => setTransferTarget({
                                                type: 'event',
                                                id: event.id,
                                                name: event.title,
                                                currentOwnerId: event.organizer_id
                                            })}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Change Owner
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stalls' && (
                    <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100 dark:divide-border">
                            {stalls.map((stall) => (
                                <div key={stall.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors">
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-foreground truncate">{stall.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 flex items-center gap-2">
                                            <span className="capitalize">{stall.category}</span>
                                            <span>•</span>
                                            <span className={`font-medium ${!stall.owner ? 'text-red-500' : ''}`}>
                                                {stall.owner?.name || 'Unknown Owner'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openForm('stall', stall, refreshStalls)}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg transition-colors"
                                            title="Edit Stall"
                                        >
                                            <Icon icon="solar:pen-new-square-linear" width={16} />
                                        </button>
                                        <button
                                            onClick={() => setTransferTarget({
                                                type: 'stall',
                                                id: stall.id,
                                                name: stall.name,
                                                currentOwnerId: stall.owner_id
                                            })}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Change Owner
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Transfer Ownership Modal */}
            {transferTarget && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen p-4">
                    <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm" onClick={() => setTransferTarget(null)} />
                    <div className="relative z-10 w-full max-w-lg bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-40 max-h-[85vh]">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-muted/20">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-foreground text-base leading-tight">Transfer Ownership</h3>
                                <p className="text-[10px] text-gray-500 dark:text-muted-foreground truncate max-w-[300px]">Target: {transferTarget.name}</p>
                            </div>
                            <button onClick={() => setTransferTarget(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors">
                                <Icon icon="solar:close-circle-linear" width={20} className="text-gray-500 dark:text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-5 space-y-6 overflow-y-auto">
                            {!newOwner ? (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Search New Owner</label>
                                    <div className="relative">
                                        <Icon icon="solar:magnifer-linear" className="absolute left-3 top-2.5 text-gray-400" width={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-foreground"
                                            placeholder="Search by name or email..."
                                            value={transferSearchQuery}
                                            onChange={(e) => setTransferSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        {/* Dialog Search Results - Absolute Overlay "Cool Restored" */}
                                        {transferSearchQuery.length > 2 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto z-30">
                                                {transferSearchLoading && <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2"><Icon icon="solar:spinner-linear" className="animate-spin" /> Searching...</div>}
                                                {transferSearchResults.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => setNewOwner(user)}
                                                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-muted/50 rounded-xl flex items-center gap-3 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-border"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-muted flex-shrink-0 overflow-hidden">
                                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{user.name?.[0]}</div>}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{user.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user.email}</div>
                                                        </div>
                                                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-100 dark:border-primary-500/20 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 font-bold text-base flex-shrink-0">
                                            {newOwner.avatar_url ? <img src={newOwner.avatar_url} className="w-full h-full rounded-full object-cover" /> : newOwner.name?.[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase mb-0.5">New Owner Selected</div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{newOwner.name}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-muted-foreground truncate">{newOwner.email}</div>
                                        </div>
                                        <button onClick={() => setNewOwner(null)} className="p-1.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-colors">
                                            <Icon icon="solar:pen-new-square-linear" width={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">Old Owner Status</label>
                                        <div className="grid gap-2">
                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerStatus === 'leave' ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 ring-1 ring-red-500/50' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldStatus" checked={oldOwnerStatus === 'leave'} onChange={() => setOldOwnerStatus('leave')} className="text-red-600 focus:ring-red-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-red-700 dark:text-red-400">Remove from Team (Default)</div>
                                                    <div className="text-[10px] text-red-600/70 dark:text-red-400/70 leading-tight">Old owner loses all access to manage this item.</div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerStatus === 'co_host' ? 'bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/30 ring-1 ring-primary-500/50' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldStatus" checked={oldOwnerStatus === 'co_host'} onChange={() => setOldOwnerStatus('co_host')} className="text-primary-600 focus:ring-primary-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-gray-900 dark:text-foreground">Keep as Co-Host</div>
                                                    <div className="text-[10px] text-gray-500 dark:text-muted-foreground leading-tight">Retains management access but loses ownership.</div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerStatus === 'member' ? 'bg-gray-50 border-gray-200 dark:bg-muted/20 dark:border-border ring-1 ring-gray-200 dark:ring-border' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldStatus" checked={oldOwnerStatus === 'member'} onChange={() => setOldOwnerStatus('member')} className="text-gray-600 focus:ring-gray-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-gray-900 dark:text-foreground">Keep as Member</div>
                                                    <div className="text-[10px] text-gray-500 dark:text-muted-foreground leading-tight">Limited access to the team.</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTransfer}
                                        disabled={!!actionLoading}
                                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {actionLoading ? <Icon icon="solar:spinner-linear" className="animate-spin" /> : <Icon icon="solar:check-circle-bold" />}
                                        {actionLoading ? 'Transferring...' : 'Confirm Transfer'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Role Management Modal (Existing) */}
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
                                            <h3 className="font-bold text-gray-900 dark:text-foreground">{t('admin.manageRoles')}</h3>
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
                                            {t('admin.tapToToggleRoles')}
                                        </p>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>,
                document.body
            )}
            <AppSettingsDialog isOpen={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} />
        </div >
    )
}
