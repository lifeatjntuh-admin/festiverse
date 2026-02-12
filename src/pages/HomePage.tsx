import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useFeaturedEvents, useAllEvents } from '@/lib/useData'
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

// Fest start date
const FEST_START = new Date('2026-03-15T09:00:00+05:30')

function useCountdown(target: Date) {
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return { days: 0, hours: 0, mins: 0, started: true }

    return {
        days: differenceInDays(target, now),
        hours: differenceInHours(target, now) % 24,
        mins: differenceInMinutes(target, now) % 60,
        started: false,
    }
}

const CATEGORY_TAG_COLORS: Record<string, string> = {
    cultural: 'text-purple-600 bg-purple-50',
    tech: 'text-cyan-600 bg-cyan-50',
    workshop: 'text-blue-600 bg-blue-50',
    competition: 'text-red-600 bg-red-50',
    sports: 'text-green-600 bg-green-50',
    food: 'text-orange-600 bg-orange-50',
}

export default function HomePage() {
    const { t } = useTranslation()
    const { events: featured, loading: featuredLoading } = useFeaturedEvents()
    const { events: allEvents, loading: allLoading } = useAllEvents()
    const countdown = useCountdown(FEST_START)

    // Trending = non-featured events with most registrations
    const trending = allEvents
        .filter((e) => !e.is_featured)
        .sort((a, b) => b.current_registrations - a.current_registrations)
        .slice(0, 4)

    return (
        <div className="animate-fade-in">
            {/* Hero Countdown */}
            <div className="px-4 mt-6 mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-glow p-5">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-orange-500 opacity-20 rounded-full blur-xl" />

                    <p className="text-xs font-medium text-blue-100 uppercase tracking-wider mb-2 opacity-90">
                        {countdown.started ? t('home.festIsLive') ?? 'Fest is Live! 🎉' : t('home.festStartsIn')}
                    </p>
                    {!countdown.started && (
                        <div className="flex items-end gap-1 font-mono">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold leading-none">{countdown.days}</span>
                                <span className="text-[10px] opacity-80 mt-1">{t('home.days')}</span>
                            </div>
                            <span className="text-xl font-bold mb-3 opacity-60">:</span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold leading-none">{countdown.hours}</span>
                                <span className="text-[10px] opacity-80 mt-1">{t('home.hours')}</span>
                            </div>
                            <span className="text-xl font-bold mb-3 opacity-60">:</span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold leading-none">{countdown.mins}</span>
                                <span className="text-[10px] opacity-80 mt-1">{t('home.mins')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Events (Carousel) */}
            <div className="mb-8">
                <div className="flex justify-between items-center px-4 mb-3">
                    <h3 className="text-lg font-semibold tracking-tight text-gray-900">{t('home.featuredEvents')}</h3>
                    <Link to="/schedule" className="text-xs font-medium text-primary-600 hover:text-primary-700">{t('home.seeAll')}</Link>
                </div>

                <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x-mandatory no-scrollbar">
                    {featuredLoading ? (
                        // Skeleton cards
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="snap-center shrink-0 w-[280px] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                                <div className="h-40 bg-gray-100 animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                        featured.map((event) => (
                            <Link
                                to={`/events/${event.id}`}
                                key={event.id}
                                className="snap-center shrink-0 w-[280px] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden group active:scale-[0.98] transition-transform duration-200"
                            >
                                <div className="h-40 bg-gray-200 relative overflow-hidden">
                                    {event.image_url && (
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                    )}
                                    <div className={`absolute top-3 left-3 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${CATEGORY_TAG_COLORS[event.category] || 'bg-white/90 text-gray-900'}`}>
                                        {event.category === 'cultural' && <Icon icon="solar:fire-bold" className="text-orange-500" />}
                                        {event.category === 'competition' && <Icon icon="solar:cup-star-bold" className="text-yellow-500" />}
                                        {event.category === 'workshop' && <Icon icon="solar:code-bold" className="text-purple-500" />}
                                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="solar:calendar-linear" />
                                            {format(new Date(event.start_time), 'MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="solar:map-point-linear" />
                                            {event.location}
                                        </span>
                                    </div>
                                    <div className="w-full py-2.5 bg-gray-50 hover:bg-primary-50 text-gray-900 hover:text-primary-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-gray-100">
                                        {t('home.viewDetails')}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Explore Grid */}
            <div className="px-4 mb-8">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 mb-4">{t('home.explore')}</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { key: 'music', icon: 'solar:music-note-linear', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
                        { key: 'tech', icon: 'solar:laptop-minimalistic-linear', bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-600' },
                        { key: 'food', icon: 'solar:chef-hat-linear', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600' },
                        { key: 'games', icon: 'solar:gamepad-linear', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' },
                    ].map(({ key, icon, bg, border, text }) => (
                        <div key={key} className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center ${text} ${border} border group-active:scale-95 transition-transform`}>
                                <Icon icon={icon} width={28} />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{t(`categories.${key}`)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/schedule" className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between h-28 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Icon icon="solar:calendar-add-linear" width={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">{t('home.mySchedule')}</h4>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{t('home.eventsSaved', { count: allEvents.length })}</p>
                        </div>
                    </Link>
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between h-28 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                            <Icon icon="solar:map-arrow-square-linear" width={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">{t('home.venueMap')}</h4>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{t('home.navigateCampus')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Now (from DB) */}
            <div className="px-4 pb-4">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 mb-4">{t('home.trendingNow')}</h3>
                <div className="flex flex-col gap-3">
                    {allLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                        trending.map((event) => (
                            <Link
                                to={`/events/${event.id}`}
                                key={event.id}
                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
                            >
                                {event.image_url && (
                                    <img src={event.image_url} className="w-16 h-16 rounded-lg object-cover" alt={event.title} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
                                        {!event.is_paid ? (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0 ml-2">{t('home.free')}</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded shrink-0 ml-2">₹{event.price}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 truncate">{event.description?.slice(0, 60)}...</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Icon icon="solar:calendar-linear" width={12} />
                                            {format(new Date(event.start_time), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
