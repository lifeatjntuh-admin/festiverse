import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEventsByDay, useBookmarks } from '@/lib/useData'
import { useAuthStore } from '@/lib/useAuthStore'
import { supabase } from '@/lib/supabase'
import { useScheduleStore } from '@/lib/useScheduleStore'
import { format } from 'date-fns'
import { calculateEventPositions, HOUR_HEIGHT, START_HOUR, END_HOUR } from '@/lib/scheduleLayout'
import toast from 'react-hot-toast'

import EventCard from '@/components/schedule/EventCard'

const SCROLL_TO_HOUR = 9

const FILTERS = ['allEvents', 'saved', 'going', 'technical', 'cultural', 'workshops', 'tech', 'sports', 'food'] as const

// Map schedule filter to DB categories
const FILTER_CATEGORY_MAP: Record<string, string | null> = {
    allEvents: null,
    technical: 'competition',
    cultural: 'cultural',
    workshops: 'workshop',
    tech: 'tech',
    sports: 'sports',
    food: 'food',
}

// Reverse map: category -> filter key (for URL param)
const CATEGORY_TO_FILTER: Record<string, typeof FILTERS[number]> = {
    competition: 'technical',
    cultural: 'cultural',
    workshop: 'workshops',
    tech: 'tech',
    sports: 'sports',
    food: 'food',
}

const EVENT_VARIANTS = {
    cultural: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-700/50',
        text: 'text-purple-700 dark:text-purple-300'
    },
    saved: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-700/50',
        text: 'text-yellow-700 dark:text-yellow-300'
    },
    going: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700/50',
        text: 'text-green-700 dark:text-green-300'
    },
    workshop: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-700/50',
        text: 'text-blue-700 dark:text-blue-300'
    },
    competition: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700/50',
        text: 'text-red-700 dark:text-red-300'
    },
    sports: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700/50',
        text: 'text-green-700 dark:text-green-300'
    },
    food: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-700/50',
        text: 'text-orange-700 dark:text-orange-300'
    },
    tech: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        border: 'border-cyan-200 dark:border-cyan-700/50',
        text: 'text-cyan-700 dark:text-cyan-300'
    },
    default: {
        bg: 'bg-zinc-50 dark:bg-zinc-800/50',
        border: 'border-zinc-200 dark:border-zinc-700/50',
        text: 'text-zinc-700 dark:text-zinc-300'
    }
} as const

export default function SchedulePage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const { user } = useAuthStore()
    const { activeDay } = useScheduleStore()
    const scrollContainerRef = useRef<HTMLDivElement>(null)





    // Initialize filter from URL ?category= param
    const urlCategory = searchParams.get('category')
    const initialFilter = urlCategory && CATEGORY_TO_FILTER[urlCategory]
        ? CATEGORY_TO_FILTER[urlCategory]
        : 'allEvents'
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>(initialFilter)

    // Sync filter if URL param changes
    useEffect(() => {
        if (urlCategory && CATEGORY_TO_FILTER[urlCategory]) {
            setActiveFilter(CATEGORY_TO_FILTER[urlCategory])
        }
    }, [urlCategory])

    const { events, loading } = useEventsByDay(activeDay)

    const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks(user?.uid)

    // Registered event IDs
    const [registeredIds, setRegisteredIds] = useState<string[]>([])
    useEffect(() => {
        if (!user?.uid) {
            setRegisteredIds([])
            return
        }
        supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', user.uid)
            .then(({ data }) => {
                setRegisteredIds((data ?? []).map(r => r.event_id))
            })
    }, [user?.uid])

    // Determine which events to show
    const getFilteredEvents = () => {
        // 1. Filter by active filter (Categories / Saved / Going)
        let filtered = events

        if (activeFilter === 'saved') {
            const savedEventIds = bookmarks.filter(b => b.type === 'event').map(b => b.event_id)
            filtered = events.filter(e => savedEventIds.includes(e.id))
        } else if (activeFilter === 'going') {
            filtered = events.filter(e => registeredIds.includes(e.id))
        } else if (activeFilter !== 'allEvents') {
            filtered = events.filter((e) => e.category === FILTER_CATEGORY_MAP[activeFilter])
        }

        return filtered
    }

    const filteredEvents = getFilteredEvents()
    const viewLoading = loading // Unified loading state since we filter `events` (by day)

    // Scroll to 8 AM when data loads or day changes
    // Scroll to 8 AM when data loads or day/filter changes
    useEffect(() => {
        if (!viewLoading && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = SCROLL_TO_HOUR * HOUR_HEIGHT
        }
    }, [viewLoading, activeDay, activeFilter])

    const handleBookmarkToggle = (eventId: string) => {
        if (!user) {
            toast(t('stalls.pleaseSignIn'), { icon: '🔒' })
            return
        }
        toggleBookmark(eventId)
    }

    const handleRegistrationToggle = async (eventId: string) => {
        if (!user) {
            toast(t('stalls.pleaseSignIn'), { icon: '🔒' })
            return
        }

        const isRegistered = registeredIds.includes(eventId)

        // Optimistic update
        setRegisteredIds(prev =>
            isRegistered
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        )

        if (isRegistered) {
            const { error } = await supabase
                .from('event_registrations')
                .delete()
                .eq('user_id', user.uid)
                .eq('event_id', eventId)

            if (error) {
                toast.error(t('common.error'))
                // Revert
                setRegisteredIds(prev => [...prev, eventId])
            }
        } else {
            const { error } = await supabase
                .from('event_registrations')
                .insert({
                    event_id: eventId,
                    user_id: user.uid,
                    payment_status: 'completed',
                    checked_in: false,
                })

            if (error) {
                toast.error(t('common.error'))
                // Revert
                setRegisteredIds(prev => prev.filter(id => id !== eventId))
            } else {
                toast.success(t('event.registeredYou'))
            }
        }
    }

    return (
        <div className="animate-fade-in flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Header Section - Split for sliding door effect */}

            {/* Scrollable Container for the rest */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative no-scrollbar bg-background/50">

                {/* 1. Day Tabs - REMOVED (Moved to App Layout Header) */}

                {/* 2. Filter Chips - Sticky (Sticks to top inside the scroll container) */}
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm py-3 px-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {FILTERS.map((filter) => {
                            const isSpecial = filter === 'saved' || filter === 'going'
                            const isActive = activeFilter === filter

                            return (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5',
                                        isActive
                                            ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                                            : isSpecial
                                                ? 'bg-card text-foreground border-border hover:border-primary/50'
                                                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                    )}
                                >
                                    {filter === 'saved' && <Icon icon={isActive ? "solar:bookmark-bold" : "solar:bookmark-linear"} width={14} />}
                                    {filter === 'going' && <Icon icon={isActive ? "solar:check-circle-bold" : "solar:check-circle-linear"} width={14} />}
                                    {t(`schedule.${filter}`)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Timeline Grid */}
                {viewLoading ? (
                    <div className="flex items-center justify-center h-full pt-20">
                        <Icon icon="svg-spinners:3-dots-fade" width={40} className="text-muted-foreground" />
                    </div>
                ) : (activeFilter === 'saved' || activeFilter === 'going') && !user ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in pt-20">
                        <Icon icon="solar:lock-keyhole-minimalistic-bold-duotone" className="text-muted-foreground mx-auto mb-3" width={48} />
                        <h3 className="text-lg font-bold text-foreground mb-1">{t('common.signInRequired')}</h3>
                        <p className="text-sm text-muted-foreground font-medium mb-4">{t('stalls.pleaseSignIn')}</p>
                        <a href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg hover:bg-primary/90 transition-transform active:scale-95">
                            {t('auth.signIn')}
                        </a>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in pt-20">
                        <Icon icon="solar:calendar-search-linear" className="text-muted-foreground mx-auto mb-3" width={48} />
                        <p className="text-sm text-muted-foreground font-medium">{t('schedule.noFilterResults')}</p>
                    </div>
                ) : (
                    <div className="relative w-full" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT + 50 }}>
                        {/* Time Slots Background */}
                        {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full border-t border-border/40 text-xs text-muted-foreground/40 pl-2 pointer-events-none flex"
                                style={{ top: i * HOUR_HEIGHT }}
                            >
                                <span className="-mt-3 block bg-background/50 backdrop-blur-sm w-fit px-1 rounded z-10">
                                    {format(new Date().setHours(START_HOUR + i, 0), 'h a')}
                                </span>
                            </div>
                        ))}

                        {/* Events Container */}
                        <div className="absolute inset-0 ml-16 mr-2 mt-2 z-20">
                            {calculateEventPositions(filteredEvents).map((event) => {
                                const variant = EVENT_VARIANTS[event.category as keyof typeof EVENT_VARIANTS] || EVENT_VARIANTS.default

                                return (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        style={{
                                            top: event.top,
                                            height: event.height,
                                            left: `${event.left}%`,
                                            width: `${event.width}%`,
                                        }}
                                        variant={variant}
                                        isBookmarked={isBookmarked(event.id)}
                                        onBookmarkToggle={handleBookmarkToggle}
                                        isRegistered={registeredIds.includes(event.id)}
                                        onRegistrationToggle={handleRegistrationToggle}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
