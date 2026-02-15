import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/lib/useAuthStore'
import {
    useMyEvents,
    useMyStalls,
    useEventRegistrations,
    toggleEventPublish,
    toggleStallActive,
} from '@/lib/useData'
import { useFormStore } from '@/lib/useFormStore'

import type { Event, Stall } from '@/types/database'
import toast from 'react-hot-toast'

import { format } from 'date-fns'
import { StallHeartsList } from '@/components/organiser/StallHeartsList'

// ─── Helpers ──────────────────────────




// ─── Categories ──────────────────────
// (Moved to component files, but likely need export if used elsewhere. 
// For now, they are only used in the forms, so we can remove them here 
// or keep them if other parts of this file use them. 
// Checking... they are NOT used in the main render, only in the forms. 
// So safe to remove.)



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Registration Viewer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function RegistrationsList({ eventId }: { eventId: string }) {
    const { t } = useTranslation()
    const { registrations, loading, toggleCheckIn } = useEventRegistrations(eventId)
    if (loading) return (
        <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-muted rounded-lg animate-pulse" />)}
        </div>
    )
    if (registrations.length === 0) return (
        <div className="py-6 text-center">
            <Icon icon="solar:users-group-rounded-linear" width={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('organiser.noRegistrationsYet')}</p>
        </div>
    )
    const checkedIn = registrations.filter(r => r.checked_in).length
    return (
        <div>
            <div className="px-4 py-2 flex items-center justify-between bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">{registrations.length} registered • {checkedIn} checked in</span>
            </div>
            <div className="divide-y divide-border">
                {registrations.map(reg => (
                    <div key={reg.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {reg.profile?.avatar_url
                                ? <img src={reg.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">{reg.profile?.name?.[0]?.toUpperCase() || '?'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{reg.profile?.name || t('common.unknown')}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{reg.profile?.email} {reg.profile?.college_id && `• ${reg.profile.college_id}`}</div>
                        </div>
                        <button onClick={() => toggleCheckIn(reg.id, reg.checked_in)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${reg.checked_in ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                            <Icon icon={reg.checked_in ? 'solar:check-circle-bold' : 'solar:login-3-linear'} width={14} />
                            {reg.checked_in ? t('organiser.in') : t('organiser.checkIn')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Manager
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// (TeamManager moved to src/components/organiser/TeamManagerPanel.tsx)


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function OrganiserTools() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()

    const isEventManager = profile?.roles?.some(r => ['event_manager', 'app_admin', 'super_admin'].includes(r))
    const isStallManager = profile?.roles?.some(r => ['stall_manager', 'app_admin', 'super_admin'].includes(r))

    const { events, loading: eventsLoading, refresh: refreshEvents, setEvents } = useMyEvents(user?.uid, profile?.roles)
    const { stalls, loading: stallsLoading, refresh: refreshStalls, setStalls } = useMyStalls(user?.uid, profile?.roles)

    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
    const [expandedStall, setExpandedStall] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'events' | 'stalls'>('events')

    const { openForm } = useFormStore()

    const addForm = (type: 'event' | 'stall', entity: Event | Stall | null) => {
        openForm(type, entity, () => {
            if (type === 'event') refreshEvents()
            if (type === 'stall') refreshStalls()
        })
    }

    // Guard
    if (!profile?.roles?.some(r => ['event_manager', 'stall_manager', 'team_member', 'app_admin', 'super_admin'].includes(r))) {
        return (
            <div className="bg-background flex items-center justify-center p-4" style={{ minHeight: 'calc(100dvh - 120px)' }}>
                <div className="text-center">
                    <Icon icon="solar:lock-keyhole-linear" width={48} className="text-muted-foreground mx-auto mb-3" />
                    <h2 className="font-bold text-foreground mb-1">{t('organiser.unauthorized')}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{t('organiser.needRole')}</p>
                    <Link to="/profile" className="text-primary-600 font-semibold text-sm">{t('organiser.backToProfile')}</Link>
                </div>
            </div>
        )
    }

    const totalRegistrations = events.reduce((sum, e) => sum + (e.current_registrations || 0), 0)

    const handleTogglePublish = async (event: Event) => {
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e))
        const { error } = await toggleEventPublish(event.id, event.is_published)
        if (error) {
            setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: event.is_published } : e))
            toast.error('Failed to update')
        } else { toast.success(event.is_published ? 'Unpublished' : 'Published!') }
    }

    const handleToggleStall = async (stall: Stall) => {
        setStalls(prev => prev.map(s => s.id === stall.id ? { ...s, is_active: !s.is_active } : s))
        const { error } = await toggleStallActive(stall.id, stall.is_active)
        if (error) {
            setStalls(prev => prev.map(s => s.id === stall.id ? { ...s, is_active: stall.is_active } : s))
            toast.error('Failed to update')
        } else { toast.success(stall.is_active ? 'Deactivated' : 'Activated!') }
    }







    return (
        <div className="bg-background pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <Icon icon="solar:arrow-left-linear" width={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{t('organiser.title')}</h1>
                        <p className="text-[10px] text-white/80">{t('organiser.subtitle')}</p>
                    </div>
                </div>

                {/* Removed Global Admin Banner as per request */}

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{events.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">{t('organiser.events')}</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{stalls.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">{t('organiser.stalls')}</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{totalRegistrations}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">{t('organiser.registrations')}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-card sticky top-0 z-10">
                <button onClick={() => setActiveTab('events')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'events' ? 'text-orange-600 border-orange-500' : 'text-muted-foreground border-transparent'}`}>
                    <Icon icon="solar:calendar-bold" width={16} className="inline mr-1.5 -mt-0.5" />{t('organiser.myEvents')}
                </button>
                <button onClick={() => setActiveTab('stalls')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'stalls' ? 'text-orange-600 border-orange-500' : 'text-muted-foreground border-transparent'}`}>
                    <Icon icon="solar:shop-2-bold" width={16} className="inline mr-1.5 -mt-0.5" />{t('organiser.myStalls')}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {activeTab === 'events' && (
                    <>
                        {isEventManager && (
                            <button onClick={() => addForm('event', null)}
                                className="w-full p-3 bg-card rounded-xl border-2 border-dashed border-primary/30 text-primary flex items-center justify-center gap-2 font-semibold text-sm hover:bg-primary/5 transition-colors active:scale-[0.99]">
                                <Icon icon="solar:add-circle-linear" width={20} />
                                {t('organiser.createNewEvent')}
                            </button>
                        )}
                        {eventsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                                        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:calendar-search-linear" width={48} className="text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">{t('organiser.noEventsYet')}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{t('organiser.createFirstEvent')}</p>
                            </div>
                        ) : events.map(event => (
                            <div key={event.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-card-foreground truncate">{event.title}</h4>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${event.is_published ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}`}>
                                                        {event.is_published ? t('organiser.live') : t('organiser.draft')}
                                                    </span>
                                                    {['owner', 'co_host', 'member'].includes(event.user_relation || '') && (
                                                        <span className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground">
                                                            {event.user_relation?.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                    {event.user_relation === 'admin' && (
                                                        <span className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" width={12} />{format(new Date(event.start_time), 'MMM d, h:mm a')}</span>
                                                <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" width={12} />{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/80">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="solar:users-group-rounded-linear" width={12} />
                                                    {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''} {t('organiser.registrationsLabel')}
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-muted rounded-full text-[10px] font-medium">{event.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border overflow-x-auto">
                                        <button onClick={() => addForm('event', event)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap">
                                            <Icon icon="solar:pen-linear" width={14} />{t('common.edit')}
                                        </button>
                                        <button onClick={() => handleTogglePublish(event)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${event.is_published ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'}`}>
                                            <Icon icon={event.is_published ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={14} />
                                            {event.is_published ? t('organiser.unpublish') : t('organiser.publish')}
                                        </button>
                                        <button onClick={() => openForm('team', event, refreshEvents)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 transition-colors whitespace-nowrap">
                                            <Icon icon="solar:users-group-two-rounded-linear" width={14} />
                                            Team
                                        </button>
                                        <button onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors ml-auto whitespace-nowrap">
                                            <Icon icon="solar:users-group-rounded-linear" width={14} />
                                            {expandedEvent === event.id ? t('organiser.hide') : t('organiser.registrationsLabel')}
                                        </button>


                                    </div>
                                </div>
                                {expandedEvent === event.id && (
                                    <div className="border-t border-border bg-muted/30">
                                        <RegistrationsList eventId={event.id} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'stalls' && (
                    <>
                        {isStallManager && (
                            <button onClick={() => addForm('stall', null)}
                                className="w-full p-3 bg-card rounded-xl border-2 border-dashed border-primary/30 text-primary flex items-center justify-center gap-2 font-semibold text-sm hover:bg-primary/5 transition-colors active:scale-[0.99]">
                                <Icon icon="solar:add-circle-linear" width={20} />
                                {t('organiser.createNewStall')}
                            </button>
                        )}
                        {stallsLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                                        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : stalls.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:shop-2-linear" width={48} className="text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">{t('organiser.noStallsYet')}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{t('organiser.createFirstStall')}</p>
                            </div>
                        ) : stalls.map(stall => (
                            <div key={stall.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        {stall.images?.[0] && (
                                            <img src={stall.images[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted" alt="" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-card-foreground truncate">{stall.name}</h4>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${stall.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                                                        {stall.is_active ? t('organiser.active') : t('organiser.inactive')}
                                                    </span>
                                                    {['owner', 'co_host', 'member'].includes(stall.user_relation || '') && (
                                                        <span className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground">
                                                            {stall.user_relation?.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                    {stall.user_relation === 'admin' && (
                                                        <span className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" width={12} />{stall.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/80">
                                                <span className="px-1.5 py-0.5 bg-muted rounded-full text-[10px] font-medium">{stall.category}</span>
                                                <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                                                    <Icon icon="solar:heart-bold" width={12} />
                                                    {stall.bookmarks?.[0]?.count || 0} {t('organiser.hearts')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border overflow-x-auto">
                                        <button onClick={() => addForm('stall', stall)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors">
                                            <Icon icon="solar:pen-linear" width={14} />{t('common.edit')}
                                        </button>
                                        <button onClick={() => handleToggleStall(stall)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stall.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'}`}>
                                            <Icon icon={stall.is_active ? 'solar:power-bold' : 'solar:power-linear'} width={14} />
                                            {stall.is_active ? t('organiser.deactivate') : t('organiser.activate')}
                                        </button>
                                        <button onClick={() => openForm('stall_team', stall, refreshStalls)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 transition-colors whitespace-nowrap">
                                            <Icon icon="solar:users-group-two-rounded-linear" width={14} />
                                            {t('organiser.team')}
                                        </button>
                                        <button onClick={() => setExpandedStall(expandedStall === stall.id ? null : stall.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors whitespace-nowrap ml-auto">
                                            <Icon icon="solar:heart-linear" width={14} />
                                            {expandedStall === stall.id ? t('organiser.hide') : t('organiser.hearts')}
                                        </button>


                                    </div>
                                </div>
                                {expandedStall === stall.id && (
                                    <div className="border-t border-border bg-muted/30">
                                        <StallHeartsList stallId={stall.id} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
