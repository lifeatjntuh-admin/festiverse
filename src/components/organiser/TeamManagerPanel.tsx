import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { useEventTeam, useSearchProfiles } from '@/lib/useData'
import { useFormStore } from '@/lib/useFormStore'
import { Event } from '@/types/database'
import toast from 'react-hot-toast'

interface TeamManagerPanelProps {
    formId: string
    event: Event
    minimized: boolean
    pillIndex: number
}

export default function TeamManagerPanel({ formId, event, minimized, pillIndex }: TeamManagerPanelProps) {
    const { closeForm, toggleMinimize } = useFormStore()
    const { t } = useTranslation()
    const { members, loading, addMember, removeMember } = useEventTeam(event.id)
    const [searchQuery, setSearchQuery] = useState('')
    const { profiles: searchResults, loading: searchLoading } = useSearchProfiles(searchQuery)
    const [targetRole, setTargetRole] = useState<'member' | 'co_host'>('member')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const onClose = () => closeForm(formId)
    const onToggleMinimize = () => toggleMinimize(formId)

    const handleAdd = async (userId: string) => {
        const { error } = await addMember(userId, targetRole)
        if (error) {
            toast.error(t('organiser.failedToAdd', { msg: error.message }))
            return
        }
        setSearchQuery('')
        toast.success(t('organiser.teamMemberAddedAs', { role: targetRole === 'co_host' ? t('event.roleCoOrganizer') : t('event.roleMember') }))
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

    // ── Minimized pill ──
    if (minimized) {
        return createPortal(
            <div className="fixed left-0 right-0 z-[100] px-3 max-w-3xl mx-auto pointer-events-none" style={{ bottom: `${76 + pillIndex * 64}px` }}>
                <button
                    onClick={onToggleMinimize}
                    className="w-full pointer-events-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:users-group-two-rounded-bold" width={18} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-bold truncate">{t('organiser.teamPill', { title: event.title })}</div>
                        <div className="text-[10px] text-white/70">{t('organiser.tapToManageTeam')}</div>
                    </div>
                    <Icon icon="solar:maximize-square-linear" width={20} className="text-white/80 flex-shrink-0" />
                </button>
            </div>,
            document.body
        )
    }

    return createPortal(

        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-background flex flex-col" style={{ height: '100dvh' }}>
            <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between bg-white dark:bg-card shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors flex-shrink-0">
                        <Icon icon="solar:close-circle-linear" width={24} className="text-gray-400 dark:text-muted-foreground" />
                    </button>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-foreground leading-tight">{t('organiser.manageTeam')}</h3>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{event.title}</p>
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
                        <div className="ml-auto flex bg-gray-100 dark:bg-muted p-0.5 rounded-lg">
                            <button
                                onClick={() => setTargetRole('member')}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${targetRole === 'member' ? 'bg-white dark:bg-background shadow-sm text-gray-800 dark:text-foreground' : 'text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                {t('event.roleMember')}
                            </button>
                            <button
                                onClick={() => setTargetRole('co_host')}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${targetRole === 'co_host' ? 'bg-white dark:bg-background shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                {t('event.roleCoOrganizer')}
                            </button>
                        </div>
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
                        {/* Search Results Dropdown */}
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
                                        {searchResults.map(user => {
                                            const existingMember = members.find(m => m.user_id === user.id)
                                            const isOrganizer = event.organizer_id === user.id

                                            return (
                                                <div key={user.id} className="p-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors group">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-muted-foreground border border-white dark:border-border shadow-sm">
                                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : user.name?.[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{user.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user.email}</div>
                                                        </div>
                                                    </div>

                                                    {isOrganizer ? (
                                                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{t('organiser.owner')}</span>
                                                    ) : existingMember ? (
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                            {existingMember.role === 'co_host' ? t('organiser.coOrgShort') : t('organiser.added')}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAdd(user.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 active:scale-95"
                                                        >
                                                            {t('common.add')}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {targetRole === 'co_host' && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-100 dark:border-amber-500/20 flex gap-2 items-start">
                            <Icon icon="solar:info-circle-bold" className="mt-0.5 flex-shrink-0" />
                            {t('organiser.roleRequirementNote', { role: t('profile.roleEventManager') })}
                        </div>
                    )}
                </div>

                {/* Current Members List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase">{t('organiser.currentTeam', { count: members.length })}</label>
                        {loading && <Icon icon="solar:spinner-linear" className="animate-spin text-gray-400 dark:text-muted-foreground" width={14} />}
                    </div>

                    {members.length === 0 && !loading ? (
                        <div className="text-center py-8 bg-gray-50/50 dark:bg-muted/10 rounded-xl border border-dashed border-gray-200 dark:border-border">
                            <Icon icon="solar:users-group-two-rounded-linear" className="mx-auto text-gray-300 dark:text-muted-foreground mb-2" width={32} />
                            <p className="text-xs text-gray-400 dark:text-muted-foreground">{t('organiser.noTeamMembersYet')}</p>
                            <p className="text-[10px] text-gray-300 dark:text-muted-foreground/70">{t('organiser.addMembersHelp')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Organizer Card (ReadOnly) */}
                            {event.organizer && (
                                <div className="flex items-center justify-between p-3 bg-amber-50/30 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-9 h-9 rounded-full bg-white dark:bg-muted flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-muted-foreground border-2 border-amber-200 dark:border-amber-500/30 shadow-sm">
                                            {event.organizer.avatar_url ? <img src={event.organizer.avatar_url} className="w-full h-full rounded-full object-cover" /> : event.organizer.name?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{event.organizer.name}</div>
                                                <Icon icon="solar:crown-star-bold" className="text-amber-400" width={14} />
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-muted-foreground truncate">Organizer (Owner)</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Members */}
                            {members.filter(m => m.user_id !== event.organizer_id).map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-9 h-9 rounded-full bg-white dark:bg-muted flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-muted-foreground border border-white dark:border-border shadow-sm">
                                            {member.profile?.avatar_url ? <img src={member.profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : member.profile?.name?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{member.profile?.name || 'Unknown'}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground">
                                                <span className={`px-1.5 py-0 rounded text-[10px] font-semibold ${member.role === 'co_host' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground'}`}>
                                                    {member.role === 'co_host' ? 'Co-Organizer' : 'Member'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(member.user_id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove member"
                                    >
                                        <Icon icon="solar:trash-bin-trash-linear" width={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
