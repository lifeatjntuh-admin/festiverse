import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { useStallTeam, useSearchProfiles, transferStallOwnership } from '@/lib/useData'
import { useFormStore } from '@/lib/useFormStore'
import { useAuthStore } from '@/lib/useAuthStore'
import { Stall } from '@/types/database'
import toast from 'react-hot-toast'

interface StallTeamManagerPanelProps {
    formId: string
    stall: Stall
    onSaved?: () => void
    minimized: boolean
    pillIndex: number
}

export default function StallTeamManagerPanel({ formId, stall, onSaved, minimized, pillIndex }: StallTeamManagerPanelProps) {
    const { closeForm, toggleMinimize } = useFormStore()
    const { user } = useAuthStore()
    const { t } = useTranslation()
    const { members, loading, addMember, removeMember, leaveTeam } = useStallTeam(stall.id)
    const [searchQuery, setSearchQuery] = useState('')
    const { profiles: searchResults, loading: searchLoading } = useSearchProfiles(searchQuery)
    const [mounted, setMounted] = useState(false)

    // Transfer Ownership State
    const [isTransferring, setIsTransferring] = useState(false)
    const [showTransferDialog, setShowTransferDialog] = useState(false)
    const [transferTargetUser, setTransferTargetUser] = useState<any>(null)
    const [oldOwnerRole, setOldOwnerRole] = useState<'co_host' | 'member' | 'leave'>('leave')

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const onClose = () => closeForm(formId)
    const onToggleMinimize = () => toggleMinimize(formId)

    const handleAdd = async (userId: string, role: 'member' | 'co_host') => {
        const { error } = await addMember(userId, role)
        if (error) {
            toast.error(t('organiser.failedToAdd', { msg: error.message }))
            return
        }
        setSearchQuery('')
        toast.success(t('organiser.teamMemberAddedAs', { role: role === 'co_host' ? t('organiser.coHost') : t('event.roleMember') }))
    }

    const handleRemove = async (userId: string) => {
        if (!confirm(t('organiser.confirmRemoveMember'))) return
        const { error } = await removeMember(userId)
        if (error) {
            toast.error(t('organiser.failedToRemove', { msg: error.message }))
        } else {
            toast.success(t('organiser.teamMemberRemoved'))
        }
    }

    const handleLeave = async () => {
        if (!confirm(t('organiser.confirmLeaveTeam'))) return
        const { error } = await leaveTeam()
        if (error) {
            toast.error(t('organiser.failedToLeave'))
        } else {
            toast.success(t('organiser.leftTeamSuccess'))
            onClose()
        }
    }

    const handleTransferOwnership = async () => {
        if (!transferTargetUser) return
        if (!confirm(t('organiser.confirmTransferOwnership', { name: transferTargetUser.name }))) return

        setIsTransferring(true)
        const { error } = await transferStallOwnership(stall.id, transferTargetUser.id, oldOwnerRole)

        if (error) {
            toast.error(t('organiser.transferFailed', { msg: error.message }))
            setIsTransferring(false)
        } else {
            toast.success(t('organiser.transferSuccess'))
            setIsTransferring(false)
            setShowTransferDialog(false)
            onSaved?.()
            onClose()
        }
    }

    // ── Minimized pill ──
    if (minimized) {
        return createPortal(
            <div className="fixed left-0 right-0 z-[100] px-3 max-w-3xl mx-auto pointer-events-none" style={{ bottom: `${76 + pillIndex * 64}px` }}>
                <button
                    onClick={onToggleMinimize}
                    className="w-full pointer-events-auto bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:users-group-two-rounded-bold" width={18} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-bold truncate">{t('organiser.teamPill', { title: stall.name })}</div>
                        <div className="text-[10px] text-white/70">{t('organiser.tapToManageTeam')}</div>
                    </div>
                    <Icon icon="solar:maximize-square-linear" width={20} className="text-white/80 flex-shrink-0" />
                </button>
            </div>,
            document.body
        )
    }

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-background flex flex-col" style={{ height: '100dvh' }}>
                    <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between bg-white dark:bg-card shadow-sm flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors flex-shrink-0">
                                <Icon icon="solar:close-circle-linear" width={24} className="text-gray-400 dark:text-muted-foreground" />
                            </button>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-foreground leading-tight">{t('organiser.manageStallTeam')}</h3>
                                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{stall.name}</p>
                            </div>
                        </div>
                        <button onClick={onToggleMinimize} className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors" title={t('organiser.minimize')}>
                            <Icon icon="solar:minimize-square-linear" width={20} className="text-gray-500 dark:text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Search */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase flex items-center gap-2">
                                {t('organiser.addNewMember')}
                            </label>
                            <div className="relative z-20">
                                <Icon icon="solar:magnifer-linear" className="absolute left-3 top-2.5 text-gray-400 dark:text-muted-foreground" width={18} />
                                <input
                                    type="text"
                                    placeholder={t('organiser.searchPlaceholder')}
                                    className="w-full bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-foreground"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {/* Search Results Dropdown - Absolute Overlay "Cool Restored" */}
                                {searchQuery.length > 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-30">
                                        {searchLoading ? (
                                            <div className="p-4 text-center text-xs text-gray-400 dark:text-muted-foreground flex items-center justify-center gap-2">
                                                <Icon icon="solar:spinner-linear" className="animate-spin" /> {t('organiser.searching')}
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-gray-400 dark:text-muted-foreground">{t('organiser.noUsersFound')}</div>
                                        ) : (
                                            <div className="divide-y divide-gray-50 dark:divide-border">
                                                {searchResults.map(user => (
                                                    <UserResultItem
                                                        key={user.id}
                                                        user={user}
                                                        existingMember={members.find(m => m.user_id === user.id)}
                                                        isOwner={stall.owner_id === user.id}
                                                        onAdd={handleAdd}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Members List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase">{t('organiser.currentTeam', { count: members.length + (stall.owner ? 1 : 0) })}</label>
                                {loading && <Icon icon="solar:spinner-linear" className="animate-spin text-gray-400 dark:text-muted-foreground" width={14} />}
                            </div>

                            {members.length === 0 && !stall.owner ? (
                                <div className="text-center py-8 bg-gray-50/50 dark:bg-muted/10 rounded-xl border border-dashed border-gray-200 dark:border-border">
                                    <Icon icon="solar:users-group-two-rounded-linear" className="mx-auto text-gray-300 dark:text-muted-foreground mb-2" width={32} />
                                    <p className="text-xs text-gray-400 dark:text-muted-foreground">{t('organiser.noTeamMembersYet')}</p>
                                    <p className="text-[10px] text-gray-300 dark:text-muted-foreground/70">{t('organiser.addMembersHelp')}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Owner Card (ReadOnly) */}
                                    {/* Owner Card (ReadOnly) */}
                                    {stall.owner && (
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-9 h-9 rounded-full bg-white dark:bg-muted flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-muted-foreground border border-white dark:border-border shadow-sm">
                                                    {stall.owner.avatar_url ? <img src={stall.owner.avatar_url} className="w-full h-full rounded-full object-cover" /> : stall.owner.name?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                                                        {stall.owner.name} {user?.uid === stall.owner_id && <span className="text-primary-600 dark:text-primary-400 font-normal">{t('common.youBrackets')}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground">
                                                        <span className="px-1.5 py-0 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground">
                                                            {t('organiser.owner')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user?.uid === stall.owner_id && (
                                                <button
                                                    onClick={() => setShowTransferDialog(true)}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-700 dark:text-foreground rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    {t('organiser.transfer')}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Members */}
                                    {members.filter(m => m.user_id !== stall.owner_id).map(member => {
                                        const isCurrentUser = member.user_id === user?.uid
                                        return (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-colors group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-9 h-9 rounded-full bg-white dark:bg-muted flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-muted-foreground border border-white dark:border-border shadow-sm">
                                                        {member.profile?.avatar_url ? <img src={member.profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : member.profile?.name?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                                                            {member.profile?.name || t('common.unknown')} {isCurrentUser && <span className="text-primary-600 dark:text-primary-400 font-normal">{t('common.youBrackets')}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground">
                                                            <span className="px-1.5 py-0 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground">
                                                                {member.role === 'co_host' ? t('organiser.coHostShortBadge') : t('organiser.member')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isCurrentUser ? (
                                                    <button
                                                        onClick={handleLeave}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                                                        title={t('organiser.leaveTeam')}
                                                    >
                                                        {t('organiser.leave')}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRemove(member.user_id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title={t('organiser.removeMember')}
                                                    >
                                                        <Icon icon="solar:trash-bin-trash-linear" width={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Transfer Ownership Dialog */}
            {showTransferDialog && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransferDialog(false)} />
                    {/* Compact Modal */}
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-muted/20">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-foreground text-base leading-tight">{t('organiser.transferOwnership')}</h3>
                                <p className="text-[10px] text-gray-500 dark:text-muted-foreground">{t('organiser.selectNewOwner')}</p>
                            </div>
                            <button onClick={() => setShowTransferDialog(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors">
                                <Icon icon="solar:close-circle-linear" width={20} className="text-gray-500 dark:text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-3 overflow-y-auto space-y-4">
                            {!transferTargetUser ? (
                                <div className="space-y-4">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex gap-2.5">
                                        <Icon icon="solar:danger-triangle-bold" className="text-amber-500 flex-shrink-0 mt-0.5" width={18} />
                                        <div className="text-[11px] text-amber-700 dark:text-amber-400">
                                            <span className="font-bold block mb-0.5">{t('common.warning')}</span>
                                            {t('organiser.transferWarning')}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase">{t('organiser.searchUser')}</label>
                                        <div className="relative">
                                            <Icon icon="solar:magnifer-linear" className="absolute left-3 top-3 text-gray-400" width={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-foreground"
                                                placeholder={t('organiser.searchPlaceholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            {/* Dialog Search Results - Absolute Overlay "Cool Restored" */}
                                            {searchQuery.length > 2 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto z-30">
                                                    {searchLoading && <div className="text-center py-4 text-xs text-gray-400 flex items-center justify-center gap-2"><Icon icon="solar:spinner-linear" className="animate-spin" /> {t('organiser.searching')}</div>}
                                                    {searchResults.map(user => {
                                                        // Must have stall_manager role to own a stall
                                                        const canOwn = user.roles && (user.roles.includes('stall_manager') || user.roles.includes('app_admin') || user.roles.includes('super_admin'))
                                                        if (!canOwn) return null

                                                        return (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => setTransferTargetUser(user)}
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
                                                        )
                                                    })}
                                                    {!searchLoading && searchQuery.length > 2 && searchResults.filter(u => u.roles?.includes('stall_manager') || u.roles?.includes('app_admin') || u.roles?.includes('super_admin')).length === 0 && (
                                                        <div className="text-center py-4 text-xs text-gray-400">
                                                            {t('organiser.noEligibleUsersFound')} <br />
                                                            <span className="opacity-70">({t('organiser.mustHaveStallManagerRole')})</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-100 dark:border-primary-500/20 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 font-bold text-base flex-shrink-0">
                                            {transferTargetUser.avatar_url ? <img src={transferTargetUser.avatar_url} className="w-full h-full rounded-full object-cover" /> : transferTargetUser.name?.[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase mb-0.5">{t('organiser.newOwner')}</div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{transferTargetUser.name}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-muted-foreground truncate">{transferTargetUser.email}</div>
                                        </div>
                                        <button onClick={() => setTransferTargetUser(null)} className="p-1.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-colors">
                                            <Icon icon="solar:pen-new-square-linear" width={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase">{t('organiser.yourNewRole')}</label>
                                        <div className="grid gap-2">
                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerRole === 'leave' ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 ring-1 ring-red-500/50' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldRole" checked={oldOwnerRole === 'leave'} onChange={() => setOldOwnerRole('leave')} className="text-red-600 focus:ring-red-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-red-700 dark:text-red-400">{t('organiser.leaveTheTeam')}</div>
                                                    <div className="text-[10px] text-red-600/70 dark:text-red-400/70 leading-tight">{t('organiser.leaveTeamDesc')}</div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerRole === 'co_host' ? 'bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/30 ring-1 ring-primary-500/50' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldRole" checked={oldOwnerRole === 'co_host'} onChange={() => setOldOwnerRole('co_host')} className="text-primary-600 focus:ring-primary-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-gray-900 dark:text-foreground">{t('organiser.becomeCoHost')}</div>
                                                    <div className="text-[10px] text-gray-500 dark:text-muted-foreground leading-tight">{t('organiser.becomeCoHostDesc')}</div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${oldOwnerRole === 'member' ? 'bg-gray-50 border-gray-200 dark:bg-muted/20 dark:border-border ring-1 ring-gray-200 dark:ring-border' : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
                                                <div className="mt-0.5"><input type="radio" name="oldRole" checked={oldOwnerRole === 'member'} onChange={() => setOldOwnerRole('member')} className="text-gray-600 focus:ring-gray-500" /></div>
                                                <div>
                                                    <div className="font-bold text-xs text-gray-900 dark:text-foreground">{t('organiser.becomeMember')}</div>
                                                    <div className="text-[10px] text-gray-500 dark:text-muted-foreground leading-tight">{t('organiser.becomeMemberDesc')}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTransferOwnership}
                                        disabled={isTransferring}
                                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isTransferring ? <Icon icon="solar:spinner-linear" className="animate-spin" /> : <Icon icon="solar:check-circle-bold" />}
                                        {isTransferring ? t('organiser.transferring') : t('organiser.confirmTransfer')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

function UserResultItem({ user, existingMember, isOwner, onAdd }: { user: any, existingMember: any, isOwner: boolean, onAdd: (id: string, role: any) => void }) {
    const { t } = useTranslation()
    const [isConfirming, setIsConfirming] = useState(false)

    // Check if user has stall_manager role
    const canBeCoHost = user.roles && Array.isArray(user.roles) && (user.roles.includes('stall_manager') || user.roles.includes('app_admin') || user.roles.includes('super_admin'))

    return (
        <div className="p-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-muted-foreground border border-white dark:border-border shadow-sm">
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : user.name?.[0]}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user.email}</div>
                    {/* Debug info if needed, or role badge */}
                    {canBeCoHost && <span className="text-[9px] px-1 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 mr-2">{t('profile.roleStallManager')}</span>}
                </div>
            </div>

            {isOwner ? (
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{t('organiser.owner')}</span>
            ) : existingMember ? (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {existingMember.role === 'co_host' ? t('organiser.coHostShortBadge') : t('organiser.added')}
                </span>
            ) : isConfirming ? (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-200">
                    <button
                        onClick={() => onAdd(user.id, 'member')}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold transition-colors"
                    >
                        {t('event.roleMember')}
                    </button>
                    <button
                        onClick={() => {
                            if (canBeCoHost) onAdd(user.id, 'co_host')
                            else toast.error(t('organiser.roleRequirementNote', { role: t('profile.roleStallManager') }))
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${canBeCoHost
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                        title={!canBeCoHost ? t('organiser.roleRequirementNote', { role: t('profile.roleStallManager') }) : ''}
                    >
                        {t('organiser.coHostShort')}
                    </button>
                    <button
                        onClick={() => setIsConfirming(false)}
                        className="p-1 hover:bg-gray-100 text-gray-400 rounded-full"
                    >
                        <Icon icon="solar:close-circle-linear" width={16} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsConfirming(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 active:scale-95"
                >
                    {t('common.add')}
                </button>
            )}
        </div>
    )
}
