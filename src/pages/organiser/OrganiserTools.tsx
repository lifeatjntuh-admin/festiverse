import { useState } from 'react'
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
    const { registrations, loading, toggleCheckIn } = useEventRegistrations(eventId)
    if (loading) return (
        <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
    )
    if (registrations.length === 0) return (
        <div className="py-6 text-center">
            <Icon icon="solar:users-group-rounded-linear" width={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No registrations yet</p>
        </div>
    )
    const checkedIn = registrations.filter(r => r.checked_in).length
    return (
        <div>
            <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-medium">{registrations.length} registered • {checkedIn} checked in</span>
            </div>
            <div className="divide-y divide-gray-50">
                {registrations.map(reg => (
                    <div key={reg.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {reg.profile?.avatar_url
                                ? <img src={reg.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">{reg.profile?.name?.[0]?.toUpperCase() || '?'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{reg.profile?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-gray-400 truncate">{reg.profile?.email} {reg.profile?.college_id && `• ${reg.profile.college_id}`}</div>
                        </div>
                        <button onClick={() => toggleCheckIn(reg.id, reg.checked_in)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${reg.checked_in ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                            <Icon icon={reg.checked_in ? 'solar:check-circle-bold' : 'solar:login-3-linear'} width={14} />
                            {reg.checked_in ? 'In' : 'Check In'}
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
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()

    const isEventManager = profile?.roles?.some(r => ['event_manager', 'app_admin', 'super_admin'].includes(r))
    const isStallManager = profile?.roles?.some(r => ['stall_manager', 'app_admin', 'super_admin'].includes(r))

    const { events, loading: eventsLoading, refresh: refreshEvents, setEvents } = useMyEvents(user?.uid, profile?.roles)
    const { stalls, loading: stallsLoading, refresh: refreshStalls, setStalls } = useMyStalls(user?.uid, profile?.roles)

    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
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
            <div className="bg-gray-50 flex items-center justify-center p-4" style={{ minHeight: 'calc(100dvh - 120px)' }}>
                <div className="text-center">
                    <Icon icon="solar:lock-keyhole-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                    <h2 className="font-bold text-gray-900 mb-1">Unauthorized</h2>
                    <p className="text-sm text-gray-500 mb-4">You need an organiser role to access this page.</p>
                    <Link to="/profile" className="text-primary-600 font-semibold text-sm">← Back to Profile</Link>
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
        <div className="bg-gray-50 pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <Icon icon="solar:arrow-left-linear" width={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Organiser Tools</h1>
                        <p className="text-[10px] text-white/80">Manage your events & stalls</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{events.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Events</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{stalls.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Stalls</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{totalRegistrations}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Registrations</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={() => setActiveTab('events')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'events' ? 'text-orange-600 border-orange-500' : 'text-gray-400 border-transparent'}`}>
                    <Icon icon="solar:calendar-bold" width={16} className="inline mr-1.5 -mt-0.5" />My Events
                </button>
                <button onClick={() => setActiveTab('stalls')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'stalls' ? 'text-orange-600 border-orange-500' : 'text-gray-400 border-transparent'}`}>
                    <Icon icon="solar:shop-2-bold" width={16} className="inline mr-1.5 -mt-0.5" />My Stalls
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {activeTab === 'events' && (
                    <>
                        {isEventManager && (
                            <button onClick={() => addForm('event', null)}
                                className="w-full p-3 bg-white rounded-xl border-2 border-dashed border-orange-200 text-orange-600 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-orange-50 transition-colors active:scale-[0.99]">
                                <Icon icon="solar:add-circle-linear" width={20} />
                                Create New Event
                            </button>
                        )}
                        {eventsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:calendar-search-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No events yet</p>
                                <p className="text-xs text-gray-400 mt-1">Create your first event above</p>
                            </div>
                        ) : events.map(event => (
                            <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{event.title}</h4>
                                                <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${event.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {event.is_published ? 'Live' : 'Draft'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" width={12} />{format(new Date(event.start_time), 'MMM d, h:mm a')}</span>
                                                <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" width={12} />{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="solar:users-group-rounded-linear" width={12} />
                                                    {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''} registered
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium">{event.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 overflow-x-auto">
                                        <button onClick={() => addForm('event', event)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">
                                            <Icon icon="solar:pen-linear" width={14} />Edit
                                        </button>
                                        <button onClick={() => handleTogglePublish(event)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${event.is_published ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                            <Icon icon={event.is_published ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={14} />
                                            {event.is_published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button onClick={() => openForm('team', event)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors whitespace-nowrap">
                                            <Icon icon="solar:users-group-two-rounded-linear" width={14} />
                                            Team
                                        </button>
                                        <button onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors ml-auto whitespace-nowrap">
                                            <Icon icon="solar:users-group-rounded-linear" width={14} />
                                            {expandedEvent === event.id ? 'Hide' : 'Registrations'}
                                        </button>
                                    </div>
                                </div>
                                {expandedEvent === event.id && (
                                    <div className="border-t border-gray-100 bg-gray-50/50">
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
                                className="w-full p-3 bg-white rounded-xl border-2 border-dashed border-orange-200 text-orange-600 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-orange-50 transition-colors active:scale-[0.99]">
                                <Icon icon="solar:add-circle-linear" width={20} />
                                Create New Stall
                            </button>
                        )}
                        {stallsLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : stalls.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:shop-2-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No stalls yet</p>
                                <p className="text-xs text-gray-400 mt-1">Create your first stall above</p>
                            </div>
                        ) : stalls.map(stall => (
                            <div key={stall.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {stall.images?.[0] && (
                                            <img src={stall.images[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{stall.name}</h4>
                                                <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stall.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {stall.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">{stall.location}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">{stall.category}</span>
                                                {stall.menu_items && <span className="text-[10px] text-gray-400">{Array.isArray(stall.menu_items) ? stall.menu_items.length : 0} items</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                    <button onClick={() => addForm('stall', stall)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                                        <Icon icon="solar:pen-linear" width={14} />Edit
                                    </button>
                                    <button onClick={() => handleToggleStall(stall)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stall.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                        <Icon icon={stall.is_active ? 'solar:power-bold' : 'solar:power-linear'} width={14} />
                                        {stall.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>


        </div>
    )
}
