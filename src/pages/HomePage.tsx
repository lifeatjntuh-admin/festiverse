import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useFeaturedEvents, useAllEvents, useBookmarks } from '@/lib/useData'
import { useAuthStore } from '@/lib/useAuthStore'
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
    cultural: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
    tech: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400',
    workshop: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    competition: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
    sports: 'text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400',
    food: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
}

export default function HomePage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const { events: featured, loading: featuredLoading } = useFeaturedEvents()
    const { events: allEvents, loading: allLoading } = useAllEvents()
    const { bookmarkCount } = useBookmarks(user?.uid)
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
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{t('home.featuredEvents')}</h3>
                    <Link to="/schedule" className="text-xs font-medium text-primary hover:text-primary/80">{t('home.seeAll')}</Link>
                </div>

                <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x-mandatory no-scrollbar">
                    {featuredLoading ? (
                        // Skeleton cards
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="snap-center shrink-0 w-[280px] bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                                <div className="h-40 bg-muted animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : featured.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-8 px-4">
                            <Icon icon="solar:star-shine-linear" width={40} className="text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">{t('home.noFeatured')}</p>
                        </div>
                    ) : (
                        featured.map((event) => (
                            <Link
                                to={`/events/${event.id}`}
                                key={event.id}
                                className="snap-center shrink-0 w-[280px] bg-card rounded-2xl border border-border shadow-soft overflow-hidden group active:scale-[0.98] transition-transform duration-200"
                            >
                                <div className="h-40 bg-muted relative overflow-hidden">
                                    {event.image_url && (
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                    )}
                                    <div className={`absolute top-3 left-3 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${CATEGORY_TAG_COLORS[event.category] || 'bg-background/90 text-foreground'}`}>
                                        {event.category === 'cultural' && <Icon icon="solar:fire-bold" className="text-orange-500" />}
                                        {event.category === 'competition' && <Icon icon="solar:cup-star-bold" className="text-yellow-500" />}
                                        {event.category === 'workshop' && <Icon icon="solar:code-bold" className="text-purple-500" />}
                                        {t(`categories.${event.category}`, { defaultValue: event.category.charAt(0).toUpperCase() + event.category.slice(1) })}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-base font-semibold text-card-foreground mb-1 leading-tight">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="solar:calendar-linear" />
                                            {format(new Date(event.start_time), 'MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="solar:map-point-linear" />
                                            {event.location}
                                        </span>
                                    </div>
                                    <div className="w-full py-2.5 bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-border">
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
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">{t('home.explore')}</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { key: 'music', category: 'cultural', icon: 'solar:music-note-linear', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
                        { key: 'tech', category: 'tech', icon: 'solar:laptop-minimalistic-linear', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
                        { key: 'food', category: 'food', icon: 'solar:chef-hat-linear', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
                        { key: 'games', category: 'sports', icon: 'solar:gamepad-linear', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20', text: 'text-green-600 dark:text-green-400' },
                    ].map(({ key, category, icon, bg, border, text }) => (
                        <Link to={`/schedule?category=${category}`} key={key} className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center ${text} ${border} border group-active:scale-95 transition-transform`}>
                                <Icon icon={icon} width={28} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{t(`categories.${key}`)}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/schedule" className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col justify-between h-28 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Icon icon="solar:calendar-add-linear" width={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-card-foreground">{t('home.mySchedule')}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{t('home.eventsSaved', { count: bookmarkCount })}</p>
                        </div>
                    </Link>
                    <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col justify-between h-28 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                            <Icon icon="solar:map-arrow-square-linear" width={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-card-foreground">{t('home.venueMap')}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{t('home.navigateCampus')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Now (from DB) */}
            <div className="px-4 pb-4">
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">{t('home.trendingNow')}</h3>
                <div className="flex flex-col gap-3">
                    {allLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
                                <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : trending.length === 0 ? (
                        <div className="text-center py-8">
                            <Icon icon="solar:fire-linear" width={40} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">{t('home.noTrending')}</p>
                        </div>
                    ) : (
                        trending.map((event) => (
                            <Link
                                to={`/events/${event.id}`}
                                key={event.id}
                                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm active:bg-muted/50 transition-colors cursor-pointer"
                            >
                                {event.image_url && (
                                    <img src={event.image_url} className="w-16 h-16 rounded-lg object-cover" alt={event.title} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-semibold text-card-foreground truncate">{event.title}</h4>
                                        {!event.is_paid ? (
                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded shrink-0 ml-2">{t('home.free')}</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded shrink-0 ml-2">₹{event.price}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">{event.description?.slice(0, 60)}...</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
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
