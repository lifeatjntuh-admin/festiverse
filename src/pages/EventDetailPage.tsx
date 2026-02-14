import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/useAuthStore'
import { useBookmarks, useRegistration, useEventTeam } from '@/lib/useData'
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

function TeamList({ event }: { event: Event }) {
    const { t } = useTranslation()
    const { members, loading } = useEventTeam(event.id)

    if (loading) return <div className="animate-pulse h-24 bg-muted rounded-xl mb-6 mx-4" />

    // Normalizing team members for display
    const teamMembers = members
        .filter(m => m.user_id !== event.organizer_id && m.profile)
        .map(m => ({
            ...m.profile!,
            role_label: m.role === 'co_host' ? t('event.roleCoOrganizer') : t('event.roleMember')
        }))

    const team = [
        ...(event.organizer ? [{ ...event.organizer, role_label: t('event.roleOrganizer') }] : []),
        ...teamMembers
    ]

    if (team.length === 0) return null

    return (
        <div className="px-4 mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('event.teamTitle')}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {team.map(member => (
                    <div key={member.id} className="flex flex-col items-center flex-shrink-0 w-20">
                        <div className="w-14 h-14 rounded-full bg-muted overflow-hidden mb-2 border-2 border-background shadow-sm flex items-center justify-center text-xl font-bold text-muted-foreground">
                            {member.avatar_url
                                ? <img src={member.avatar_url} className="w-full h-full object-cover" alt={member.name} />
                                : member.name?.[0]
                            }
                        </div>
                        <div className="text-xs font-medium text-foreground text-center truncate w-full">{member.name?.split(' ')[0]}</div>
                        <div className="text-[10px] text-muted-foreground text-center truncate w-full opacity-70">
                            {member.role_label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function EventDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const { isBookmarked, toggleBookmark } = useBookmarks(user?.uid)
    const { isRegistered, toggling: regToggling, toggleRegistration } = useRegistration(user?.uid, id)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [bookmarking, setBookmarking] = useState(false)

    useEffect(() => {
        if (!id) return

        supabase
            .from('events')
            .select('*, organizer:profiles!organizer_id(*)')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) setEvent(data as Event)
                setLoading(false)
            })
    }, [id])

    const handleBookmark = async () => {
        if (!user) {
            toast(t('stalls.pleaseSignIn') || 'Please sign in to bookmark', { icon: '🔒' })
            return
        }
        if (!event || bookmarking) return

        setBookmarking(true)
        const nowBookmarked = await toggleBookmark(event.id)
        toast.success(nowBookmarked ? t('event.bookmarked') : t('event.removedBookmark'))
        setBookmarking(false)
    }

    const handleShare = async () => {
        if (!event) return
        const shareData = {
            title: event.title,
            text: t('event.shareText', { title: event.title }),
            url: window.location.href,
        }
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success(t('event.linkCopied'))
            }
        } catch (err) {
            // User cancelled share or error
            if ((err as Error).name !== 'AbortError') {
                await navigator.clipboard.writeText(window.location.href)
                toast.success(t('event.linkCopied'))
            }
        }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="w-full h-56 bg-muted animate-pulse" />
                <div className="px-4 mt-6 space-y-4">
                    <div className="h-6 bg-muted rounded-lg animate-pulse w-3/4" />
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Icon icon="solar:calendar-search-linear" width={48} className="text-gray-400 mb-3" />
                <h1 className="text-xl font-bold text-foreground mb-2">{t('event.notFoundTitle')}</h1>
                <p className="text-sm text-gray-500 mb-4">{t('event.notFoundDesc')}</p>
                <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    {t('event.backToHome')}
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
                {user?.uid === event.organizer_id && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2">
                        <Icon icon="solar:crown-star-bold" className="text-amber-400" width={16} />
                        <span className="text-xs font-semibold text-white">{t('event.youAreOrganizer')}</span>
                    </div>
                )}
                <div className="absolute bottom-14 left-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[event.category] || 'bg-white/20 text-white'}`}>
                        {t(`categories.${event.category}`, { defaultValue: event.category.charAt(0).toUpperCase() + event.category.slice(1) })}
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
                                toast(t('stalls.pleaseSignIn') || 'Please sign in to register', { icon: '🔒' })
                                return
                            }
                            if (event.registration_link) {
                                window.open(event.registration_link, '_blank')
                            } else {
                                toast.success(t('event.registrationComingSoon'))
                            }
                        }}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm shadow-glow press-effect"
                    >
                        {event.is_paid ? `${t('event.register')} • ₹${event.price}` : t('event.register')}
                    </button>
                ) : (
                    <div className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm text-center shadow-sm">
                        {t('event.openForAll')}
                    </div>
                )}
                <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="w-12 h-12 flex items-center justify-center bg-card rounded-xl shadow-soft border border-border press-effect disabled:opacity-60"
                >
                    <Icon
                        icon={isBookmarked(event.id) ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}
                        width={20}
                        className={isBookmarked(event.id) ? 'text-primary' : 'text-muted-foreground'}
                    />
                </button>
                <button
                    onClick={handleShare}
                    className="w-12 h-12 flex items-center justify-center bg-card rounded-xl shadow-soft border border-border press-effect"
                >
                    <Icon icon="solar:share-linear" width={20} className="text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-6">
                <div className="bg-card rounded-xl p-3 shadow-sm border border-border">
                    <Icon icon="solar:calendar-linear" width={16} className="text-primary mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('event.date')}</div>
                    <div className="text-sm font-semibold text-card-foreground">{format(startDate, 'MMM d, yyyy')}</div>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm border border-border">
                    <Icon icon="solar:clock-circle-linear" width={16} className="text-primary mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('event.time')}</div>
                    <div className="text-sm font-semibold text-card-foreground">
                        {format(startDate, 'h:mm a')}
                        {endDate && ` – ${format(endDate, 'h:mm a')}`}
                    </div>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm border border-border">
                    <Icon icon="solar:map-point-linear" width={16} className="text-primary mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('event.venue')}</div>
                    <div className="text-sm font-semibold text-card-foreground">{event.location}</div>
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm border border-border">
                    <Icon icon="solar:users-group-rounded-linear" width={16} className="text-primary mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('event.registrations', { count: event.current_registrations ?? 0 })}</div>
                    <div className="text-sm font-semibold text-card-foreground">
                        {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''} {t('event.goingSuffix')}
                    </div>
                </div>
            </div>

            {/* Self-Report Registration */}
            <div className="px-4 mt-4">
                <button
                    onClick={async () => {
                        if (!user) {
                            toast('Please sign in first', { icon: '🔒' })
                            return
                        }
                        const nowRegistered = await toggleRegistration()
                        toast.success(nowRegistered ? t('event.registeredYou') : t('event.registrationRemoved'))
                    }}
                    disabled={regToggling}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all press-effect ${isRegistered
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-card border-border shadow-sm'
                        } disabled:opacity-60`}
                >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isRegistered ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                        <Icon icon={isRegistered ? 'solar:check-circle-bold' : 'solar:question-circle-linear'} width={20} />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-semibold ${isRegistered ? 'text-green-600' : 'text-card-foreground'}`}>
                            {isRegistered
                                ? t('event.registeredYou')
                                : (!event.is_paid ? t('event.areYouGoing') : t('event.didYouRegister'))}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {isRegistered ? t('event.tapToUnmark') : t('event.tapToMark')}
                        </div>
                    </div>
                    <Icon
                        icon={isRegistered ? 'solar:check-circle-bold' : 'solar:add-circle-linear'}
                        width={20}
                        className={`ml-auto flex-shrink-0 ${isRegistered ? 'text-green-500' : 'text-muted-foreground'}`}
                    />
                </button>
            </div>

            {/* Department & Tags */}
            {(event.department || event.tags?.length) && (
                <div className="px-4 mt-5">
                    <div className="flex flex-wrap gap-2">
                        {event.department && (
                            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                                {event.department}
                            </span>
                        )}
                        {event.tags?.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="px-4 mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">{t('event.about')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                </p>
            </div>

            <TeamList event={event} />

            {/* Rules */}
            {event.rules && (
                <div className="px-4 mt-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{t('event.rulesTitle')}</h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">{event.rules}</p>
                    </div>
                </div>
            )}

            {/* Venue Details */}
            {capacity && (
                <div className="px-4 mt-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{t('event.venueLabel')}</h3>
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Icon icon="solar:buildings-2-linear" width={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-card-foreground">{event.location}</div>
                            <div className="text-xs text-muted-foreground">{t('event.capacity', { count: capacity })}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
