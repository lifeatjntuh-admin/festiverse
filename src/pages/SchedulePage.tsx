import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEventsByDay } from '@/lib/useData'
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
    cultural: 'text-purple-600 bg-purple-50',
    workshop: 'text-blue-600 bg-blue-50',
    competition: 'text-red-600 bg-red-50',
    sports: 'text-green-600 bg-green-50',
    food: 'text-orange-600 bg-orange-50',
}

export default function SchedulePage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const [activeDay, setActiveDay] = useState<typeof DAYS[number]>('day1')

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

    // Filter events by category
    const filteredEvents = activeFilter === 'allEvents'
        ? events
        : events.filter((e) => e.category === FILTER_CATEGORY_MAP[activeFilter])

    return (
        <div className="animate-fade-in">
            {/* Day Tabs */}
            <div className="flex border-b border-gray-100 px-4 sticky top-0 bg-gray-50 z-10">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={cn(
                            'flex-1 py-3 text-sm font-semibold transition-all duration-200 border-b-2',
                            activeDay === day
                                ? 'text-primary-600 border-primary-600'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
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
                                ? 'bg-primary-600 text-white shadow-glow'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                        )}
                    >
                        {t(`schedule.${filter}`)}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="px-4 mt-2">
                {loading ? (
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-gray-200 border-2 border-white" />
                                <div className="h-3 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Icon icon="solar:calendar-search-linear" className="text-gray-300 mx-auto mb-3" width={48} />
                        <p className="text-sm text-gray-400 font-medium">No events for this filter</p>
                    </div>
                ) : (
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                        {filteredEvents.map((event) => (
                            <Link to={`/events/${event.id}`} key={event.id} className="relative block">
                                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                                <div className="text-xs text-gray-400 font-mono mb-2">
                                    {format(new Date(event.start_time), 'h:mm a')}
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Icon icon="solar:map-point-linear" width={14} />
                                                <span>{event.location}</span>
                                            </div>
                                            {event.end_time && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Icon icon="solar:clock-circle-linear" width={14} />
                                                    <span>{format(new Date(event.start_time), 'h:mm a')} – {format(new Date(event.end_time), 'h:mm a')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${TAG_COLORS[event.category] || 'text-primary-600 bg-primary-50'}`}>
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
