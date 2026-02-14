import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEventsByDay, useBookmarks, useAllEvents } from '@/lib/useData'
import { useAuthStore } from '@/lib/useAuthStore'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

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

const TAG_COLORS: Record<string, string> = {
    cultural: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
    workshop: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    competition: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
    sports: 'text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400',
    food: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
}

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
        <div className="animate-fade-in">
            {isViewMode ? (
                /* View Mode Banner */
                <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Icon
                            icon={viewMode === 'saved' ? 'solar:bookmark-bold' : 'solar:check-circle-bold'}
                            width={18}
                            className={viewMode === 'saved' ? 'text-primary-600' : 'text-green-500'}
                        />
                        <h3 className="text-sm font-bold text-card-foreground">
                            {viewMode === 'saved' ? 'Saved Events' : 'Registered Events'}
                        </h3>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 active:scale-95 transition-transform"
                    >
                        Show All
                    </button>
                </div>
            ) : (
                <>
                    {/* Day Tabs */}
                    <div className="flex border-b border-border px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
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
                                    'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                                    activeFilter === filter
                                        ? 'bg-primary text-primary-foreground shadow-glow'
                                        : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
                                )}
                            >
                                {t(`schedule.${filter}`)}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Timeline */}
            <div className="px-4 mt-2">
                {viewLoading ? (
                    <div className="relative pl-6 border-l-2 border-border space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-border border-2 border-background" />
                                <div className="h-3 w-16 bg-muted rounded mb-2 animate-pulse" />
                                <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                        <Icon icon="solar:calendar-search-linear" className="text-muted-foreground mx-auto mb-3" width={48} />
                        <p className="text-sm text-muted-foreground font-medium">No events for this filter</p>
                    </div>
                ) : (
                    <div className="relative pl-6 border-l-2 border-border space-y-6">
                        {filteredEvents.map((event) => (
                            <Link to={`/events/${event.id}`} key={event.id} className="relative block">
                                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary border-2 border-background" />
                                <div className="text-xs text-muted-foreground font-mono mb-2">
                                    {format(new Date(event.start_time), 'h:mm a')}
                                </div>
                                <div className="bg-card rounded-xl p-4 shadow-sm border border-border active:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-card-foreground">{event.title}</h4>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <Icon icon="solar:map-point-linear" width={14} />
                                                <span>{event.location}</span>
                                            </div>
                                            {event.end_time && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-0.5">
                                                    <Icon icon="solar:clock-circle-linear" width={14} />
                                                    <span>{format(new Date(event.start_time), 'h:mm a')} – {format(new Date(event.end_time), 'h:mm a')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${TAG_COLORS[event.category] || 'text-primary bg-primary/10'}`}>
                                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
