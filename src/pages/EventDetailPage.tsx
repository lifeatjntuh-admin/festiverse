import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/useAuthStore'
import { useBookmarks } from '@/lib/useData'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { Event } from '@/types/database'

const CATEGORY_COLORS: Record<string, string> = {
    cultural: 'bg-purple-500/20 text-purple-100',
    workshop: 'bg-blue-500/20 text-blue-100',
    competition: 'bg-red-500/20 text-red-100',
    sports: 'bg-green-500/20 text-green-100',
    food: 'bg-orange-500/20 text-orange-100',
}

export default function EventDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const { isBookmarked, toggleBookmark } = useBookmarks(user?.uid)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [bookmarking, setBookmarking] = useState(false)

    useEffect(() => {
        if (!id) return

        supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) setEvent(data as Event)
                setLoading(false)
            })
    }, [id])

    const handleBookmark = async () => {
        if (!user) {
            toast('Please sign in to bookmark', { icon: '🔒' })
            return
        }
        if (!event || bookmarking) return

        setBookmarking(true)
        const nowBookmarked = await toggleBookmark(event.id)
        toast.success(nowBookmarked ? 'Bookmarked! ⭐' : 'Removed from bookmarks')
        setBookmarking(false)
    }

    const handleShare = async () => {
        if (!event) return
        const shareData = {
            title: event.title,
            text: `Check out ${event.title} at Festiverse!`,
            url: window.location.href,
        }
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard!')
            }
        } catch (err) {
            // User cancelled share or error
            if ((err as Error).name !== 'AbortError') {
                await navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard!')
            }
        }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="w-full h-56 bg-gray-100 animate-pulse" />
                <div className="px-4 mt-6 space-y-4">
                    <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <Icon icon="solar:calendar-search-linear" width={48} className="text-gray-300 mb-3" />
                <h2 className="text-lg font-bold text-gray-700 mb-1">Event not found</h2>
                <p className="text-sm text-gray-400 mb-4">This event may have been removed or doesn't exist.</p>
                <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    ← Back to Home
                </Link>
            </div>
        )
    }

    const startDate = new Date(event.start_time)
    const endDate = event.end_time ? new Date(event.end_time) : null
    const venueDetails = event.venue_details as Record<string, unknown> | null
    const capacity = venueDetails?.capacity as number | undefined

    return (
        <div className="animate-fade-in pb-8">
            {/* Hero Image */}
            <div className="w-full h-56 relative overflow-hidden">
                {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Back button */}
                <Link
                    to="/"
                    className="absolute top-4 left-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                    <Icon icon="solar:alt-arrow-left-linear" width={20} />
                </Link>
                <div className="absolute bottom-4 left-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[event.category] || 'bg-white/20 text-white'}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                    <h1 className="text-2xl font-bold text-white font-display mt-2 drop-shadow-sm">
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 -mt-5 relative z-10">
                {event.registration_required ? (
                    <button
                        onClick={() => {
                            if (!user) {
                                toast('Please sign in to register', { icon: '🔒' })
                                return
                            }
                            if (event.registration_link) {
                                window.open(event.registration_link, '_blank')
                            } else {
                                toast.success('Registration coming soon! 🎉')
                            }
                        }}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm shadow-glow press-effect"
                    >
                        {event.is_paid ? `${t('event.register')} • ₹${event.price}` : t('event.register')}
                    </button>
                ) : (
                    <div className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm text-center shadow-sm">
                        Open for All 🎉
                    </div>
                )}
                <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-soft border border-gray-100 press-effect disabled:opacity-60"
                >
                    <Icon
                        icon={isBookmarked(event.id) ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                        width={20}
                        className={isBookmarked(event.id) ? 'text-primary-600' : 'text-gray-500'}
                    />
                </button>
                <button
                    onClick={handleShare}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-soft border border-gray-100 press-effect"
                >
                    <Icon icon="solar:share-linear" width={20} className="text-gray-500" />
                </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-6">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <Icon icon="solar:calendar-linear" width={16} className="text-primary-500 mb-1" />
                    <div className="text-xs text-gray-400">{t('event.date')}</div>
                    <div className="text-sm font-semibold text-gray-800">{format(startDate, 'MMM d, yyyy')}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <Icon icon="solar:clock-circle-linear" width={16} className="text-primary-500 mb-1" />
                    <div className="text-xs text-gray-400">{t('event.time')}</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {format(startDate, 'h:mm a')}
                        {endDate && ` – ${format(endDate, 'h:mm a')}`}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <Icon icon="solar:map-point-linear" width={16} className="text-primary-500 mb-1" />
                    <div className="text-xs text-gray-400">{t('event.venue')}</div>
                    <div className="text-sm font-semibold text-gray-800">{event.location}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <Icon icon="solar:users-group-rounded-linear" width={16} className="text-primary-500 mb-1" />
                    <div className="text-xs text-gray-400">{t('event.registrations', { count: event.current_registrations })}</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''} going
                    </div>
                </div>
            </div>

            {/* Department & Tags */}
            {(event.department || event.tags?.length) && (
                <div className="px-4 mt-5">
                    <div className="flex flex-wrap gap-2">
                        {event.department && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                {event.department}
                            </span>
                        )}
                        {event.tags?.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="px-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {event.description}
                </p>
            </div>

            {/* Rules */}
            {event.rules && (
                <div className="px-4 mt-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Rules & Instructions</h3>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-sm text-amber-800 leading-relaxed">{event.rules}</p>
                    </div>
                </div>
            )}

            {/* Venue Details */}
            {capacity && (
                <div className="px-4 mt-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Venue</h3>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                            <Icon icon="solar:buildings-2-linear" width={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-800">{event.location}</div>
                            <div className="text-xs text-gray-400">Capacity: {capacity} people</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
