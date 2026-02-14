import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEventsByDay, useBookmarks, useAllEvents } from '@/lib/useData'
import { useAuthStore } from '@/lib/useAuthStore'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { calculateEventPositions, HOUR_HEIGHT, START_HOUR, END_HOUR } from '@/lib/scheduleLayout'

const DAYS = ['day1', 'day2'] as const
const FILTERS = ['allEvents', 'technical', 'cultural', 'workshops', 'tech', 'sports', 'food'] as const

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
    const [searchParams, setSearchParams] = useSearchParams()
    const { user } = useAuthStore()
    const [activeDay, setActiveDay] = useState<typeof DAYS[number]>('day1')

    // View mode: normal schedule, registered events, or saved events
    const viewMode = searchParams.get('view') as 'registered' | 'saved' | null

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
    const { events: allEvents, loading: allEventsLoading } = useAllEvents()
    const { bookmarks } = useBookmarks(user?.uid)

    // Registered event IDs
    const [registeredIds, setRegisteredIds] = useState<string[]>([])
    useEffect(() => {
        if (!user?.uid || viewMode !== 'registered') return
        supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', user.uid)
            .then(({ data }) => {
                setRegisteredIds((data ?? []).map(r => r.event_id))
            })
    }, [user?.uid, viewMode])

    // Determine which events to show
    const getFilteredEvents = () => {
        if (viewMode === 'saved') {
            const savedEventIds = bookmarks.filter(b => b.type === 'event').map(b => b.event_id)
            return allEvents.filter(e => savedEventIds.includes(e.id))
        }
        if (viewMode === 'registered') {
            return allEvents.filter(e => registeredIds.includes(e.id))
        }
        // Normal mode: filter by day + category
        return activeFilter === 'allEvents'
            ? events
            : events.filter((e) => e.category === FILTER_CATEGORY_MAP[activeFilter])
    }

    const filteredEvents = getFilteredEvents()
    const isViewMode = viewMode === 'saved' || viewMode === 'registered'
    const viewLoading = isViewMode ? allEventsLoading : loading

    return (
        <div className="animate-fade-in flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {isViewMode ? (
                /* View Mode Banner */
                <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Icon
                            icon={viewMode === 'saved' ? 'solar:bookmark-bold' : 'solar:check-circle-bold'}
                            width={18}
                            className={viewMode === 'saved' ? 'text-primary-600' : 'text-green-500'}
                        />
                        <h3 className="text-sm font-bold text-card-foreground">
                            {viewMode === 'saved' ? t('schedule.saved') : t('schedule.registered')}
                        </h3>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 active:scale-95 transition-transform"
                    >
                        {t('common.showAll')}
                    </button>
                </div>
            ) : (
                /* Sticky Header Container */
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
                    {/* Day Tabs */}
                    <div className="flex px-4">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    'flex-1 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
                                    activeDay === day
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {t(`schedule.${day}`)}
                            </button>
                        ))}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border',
                                    activeFilter === filter
                                        ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                )}
                            >
                                {t(`schedule.${filter}`)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline Grid */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar bg-background/50">
                {viewLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Icon icon="svg-spinners:3-dots-fade" width={40} className="text-muted-foreground" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in h-full">
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
                        <div className="absolute inset-0 ml-12 mr-2 mt-2">
                            {calculateEventPositions(filteredEvents).map((event) => {
                                const variant = EVENT_VARIANTS[event.category as keyof typeof EVENT_VARIANTS] || EVENT_VARIANTS.default
                                const regCount = event.event_registrations?.[0]?.count ?? event.current_registrations ?? 0
                                const bookmarkCount = event.bookmarks?.[0]?.count ?? 0

                                return (
                                    <Link
                                        to={`/events/${event.id}`}
                                        key={event.id}
                                        className={cn(
                                            "absolute rounded-lg border p-2 flex flex-col justify-between overflow-hidden hover:z-20 hover:scale-[1.02] transition-all duration-200",
                                            "backdrop-blur-md shadow-sm hover:shadow-md",
                                            variant.bg,
                                            variant.border,
                                            variant.text
                                        )}
                                        style={{
                                            top: event.top,
                                            height: event.height,
                                            left: `${event.left}%`,
                                            width: `${event.width}%`,
                                        }}
                                    >
                                        <div className="pointer-events-none">
                                            <h4 className="text-xs font-bold leading-tight line-clamp-2">
                                                {event.title}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[10px] opacity-90 mt-1">
                                                <Icon icon="solar:map-point-linear" width={10} />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-1 flex items-end justify-between">
                                            {event.height > 60 && (
                                                <div className="text-[10px] opacity-80 font-mono">
                                                    {format(new Date(event.start_time), 'h:mm')} - {format(new Date(event.end_time), 'h:mm a')}
                                                </div>
                                            )}

                                            {/* Stats chips */}
                                            {event.height > 50 && (
                                                <div className="flex gap-1 ml-auto">
                                                    <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/10 px-1 rounded text-[9px] font-medium">
                                                        <Icon icon="solar:users-group-rounded-bold" width={9} />
                                                        <span>{regCount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/10 px-1 rounded text-[9px] font-medium">
                                                        <Icon icon="solar:bookmark-bold" width={9} />
                                                        <span>{bookmarkCount}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
