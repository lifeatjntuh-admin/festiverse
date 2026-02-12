import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const DAYS = ['day1', 'day2'] as const
const FILTERS = ['allEvents', 'technical', 'cultural', 'workshops'] as const

export default function SchedulePage() {
    const { t } = useTranslation()
    const [activeDay, setActiveDay] = useState<typeof DAYS[number]>('day1')
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('allEvents')

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
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                    {[
                        { time: '9:00 AM', title: 'Opening Ceremony', venue: 'Main Stage', tag: 'Cultural' },
                        { time: '10:30 AM', title: 'AI & ML Workshop', venue: 'CS Block', tag: 'Tech' },
                        { time: '12:00 PM', title: 'Band Performance', venue: 'Open Arena', tag: 'Music' },
                        { time: '2:00 PM', title: 'Hackathon Kickoff', venue: 'Innovation Hub', tag: 'Tech' },
                        { time: '4:00 PM', title: 'Dance Battle', venue: 'Auditorium', tag: 'Cultural' },
                    ].map(({ time, title, venue, tag }) => (
                        <div key={time} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                            <div className="text-xs text-gray-400 font-mono mb-2">{time}</div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Icon icon="solar:map-point-linear" width={14} />
                                            <span>{venue}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{tag}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
