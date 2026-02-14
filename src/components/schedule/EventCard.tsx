import * as Popover from '@radix-ui/react-popover'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutEvent } from '@/lib/scheduleLayout'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface EventCardProps {
    event: LayoutEvent
    style: React.CSSProperties
    isBookmarked: boolean
    onBookmarkToggle: (id: string) => void
    isRegistered: boolean
    onRegistrationToggle: (id: string) => void
    variant: {
        bg: string
        border: string
        text: string
    }
}

export default function EventCard({ event, style, isBookmarked, onBookmarkToggle, isRegistered, onRegistrationToggle, variant }: EventCardProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [widthPx, setWidthPx] = useState(0)

    useEffect(() => {
        if (!buttonRef.current) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidthPx(entry.contentRect.width)
            }
        })

        observer.observe(buttonRef.current)
        return () => observer.disconnect()
    }, [])

    // Adaptive Logic based on pixels (approx 7em ~ 85-90px)
    const isNarrow = widthPx < 95
    const isVeryNarrow = widthPx < 45

    const regCount = event.event_registrations?.[0]?.count ?? event.current_registrations ?? 0
    const bookmarkCount = event.bookmarks?.[0]?.count ?? 0

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    ref={buttonRef}
                    type="button"
                    className={cn(
                        "absolute rounded-lg border p-1 md:p-2 flex flex-col justify-between overflow-hidden hover:z-30 hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        "backdrop-blur-md shadow-sm hover:shadow-md",
                        open ? "ring-2 ring-primary z-30" : "",
                        variant.bg,
                        variant.border,
                        variant.text
                    )}
                    style={style}
                    onClick={(e) => {
                        e.stopPropagation()
                        // Popover trigger handles the click automatically
                    }}
                >
                    <div className="pointer-events-none w-full h-full relative">
                        {isVeryNarrow ? (
                            /* Rotated Text for Very Narrow Cards */
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h4 className="text-xs font-bold leading-tight whitespace-nowrap [writing-mode:vertical-rl] rotate-180 text-center">
                                    {event.title}
                                </h4>
                            </div>
                        ) : (
                            /* Standard Layout */
                            <div className="flex flex-col h-full">
                                <h4 className={cn("text-xs font-bold leading-tight", isNarrow ? "line-clamp-3" : "line-clamp-2")}>
                                    {event.title}
                                </h4>

                                {!isNarrow && (
                                    <div className="flex items-center gap-1 text-[10px] opacity-90 mt-1">
                                        <Icon icon="solar:map-point-linear" width={10} />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isVeryNarrow && (
                        <div className="mt-auto pt-1 flex items-end justify-between pointer-events-none">
                            {event.height > 60 && !isNarrow ? (
                                <div className="text-[10px] opacity-80 font-mono tracking-tighter">
                                    {format(new Date(event.start_time), 'h:mm')} - {format(new Date(event.end_time), 'h:mm')}
                                </div>
                            ) : null}

                            {/* Stats chips - Show even on narrow if height allows, but minimal */}
                            {event.height > 40 && (
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
                    )}
                </button>
            </Popover.Trigger>

            <AnimatePresence>
                {open && (
                    <Popover.Portal forceMount>
                        <Popover.Content sideOffset={5} collisionPadding={10} asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className="z-50 w-64 rounded-xl shadow-xl border border-border overflow-hidden outline-none"
                            >
                                {/* Image Background with Overlay Content */}
                                <div className="relative h-40 bg-muted">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                            <Icon icon="solar:calendar-bold-duotone" width={40} className="text-primary/30" />
                                        </div>
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

                                    {/* Close Button */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="p-1 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <Icon icon="solar:close-circle-bold" width={18} />
                                        </button>
                                    </div>

                                    {/* Content Overlay - stacked on image */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                                        <div className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/90 text-primary-foreground mb-1 shadow-sm uppercase tracking-wide w-fit">
                                            {t(`schedule.${event.category}`)}
                                        </div>
                                        <h3 className="text-sm font-bold text-white leading-tight drop-shadow-sm line-clamp-2">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="bg-card px-3 py-2">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Icon icon="solar:clock-circle-bold" className="text-primary" width={12} />
                                            <span className="font-medium text-foreground text-[11px]">
                                                {format(new Date(event.start_time), 'h:mm a')}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">•</span>
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <Icon icon="solar:map-point-bold" className="text-primary flex-shrink-0" width={12} />
                                            <span className="font-medium text-foreground text-[11px] truncate">{event.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-border" />

                                {/* Actions Row */}
                                <div className="bg-card px-3 py-2.5 flex items-center justify-between gap-1.5">
                                    <button
                                        onClick={() => onBookmarkToggle(event.id)}
                                        className={cn(
                                            "flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                                            isBookmarked
                                                ? "bg-primary/15 text-primary"
                                                : "bg-secondary/40 text-secondary-foreground hover:bg-secondary/60"
                                        )}
                                        title={isBookmarked ? 'Remove from saved' : 'Save to bookmarks'}
                                    >
                                        <Icon icon={isBookmarked ? "solar:bookmark-bold" : "solar:bookmark-linear"} width={13} />
                                        <span className="text-[10px] font-semibold">{bookmarkCount}</span>
                                    </button>

                                    <button
                                        onClick={() => onRegistrationToggle(event.id)}
                                        className={cn(
                                            "flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                                            isRegistered
                                                ? "bg-green-100/60 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-secondary/40 text-secondary-foreground hover:bg-secondary/60"
                                        )}
                                        title={isRegistered ? 'Cancel registration' : 'Register to go'}
                                    >
                                        <Icon icon={isRegistered ? "solar:check-circle-bold" : "solar:users-group-rounded-linear"} width={13} />
                                        <span className="text-[10px] font-semibold">{regCount}</span>
                                    </button>

                                    <Link
                                        to={`/events/${event.id}`}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors"
                                    >
                                        <span>Details</span>
                                        <Icon icon="solar:arrow-right-bold" width={11} />
                                    </Link>
                                </div>

                                <Popover.Arrow className="fill-card stroke-border" />
                            </motion.div>
                        </Popover.Content>
                    </Popover.Portal>
                )}
            </AnimatePresence>
        </Popover.Root>
    )
}
