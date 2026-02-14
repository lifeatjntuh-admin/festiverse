import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import FormOverlayManager from '@/components/organiser/FormOverlayManager'
import { ModeToggle } from '@/components/mode-toggle'
import { useScheduleStore } from '@/lib/useScheduleStore'
import { format } from 'date-fns'

import { useAppSettings } from '@/lib/useAppSettings'

const NAV_ITEMS = [
    { key: 'home', path: '/', iconLinear: 'solar:home-smile-linear', iconBold: 'solar:home-smile-bold' },
    { key: 'schedule', path: '/schedule', iconLinear: 'solar:calendar-linear', iconBold: 'solar:calendar-bold' },
    { key: 'stalls', path: '/stalls', iconLinear: 'solar:shop-linear', iconBold: 'solar:shop-bold' },
    { key: 'profile', path: '/profile', iconLinear: 'solar:user-circle-linear', iconBold: 'solar:user-circle-bold' },
] as const

export default function AppLayout() {
    const { t } = useTranslation()
    const location = useLocation()
    const { activeDay, setActiveDay } = useScheduleStore()
    const { appName, festDates } = useAppSettings()

    const isSchedulePage = location.pathname === '/schedule'

    return (
        <div className="h-dvh bg-background flex flex-col overflow-hidden text-foreground">
            <FormOverlayManager />

            {/* ===== TOP BAR (Glassmorphism) ===== */}
            <header className="sticky top-0 z-40 h-14 glass border-b border-border/40 flex items-center justify-between px-4 transition-all duration-300 dark:bg-background/80 dark:backdrop-blur-md">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-display font-bold text-sm tracking-tight shadow-glow">
                        FV
                    </div>
                    <span className={cn(
                        "font-display font-semibold text-lg tracking-tight text-foreground transition-all",
                        isSchedulePage ? "hidden md:block" : "block"
                    )}>
                        {appName || t('app.name')}
                    </span>
                </div>

                {isSchedulePage && (
                    <div className="mx-auto md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex items-center bg-secondary/50 p-1 rounded-full border border-border/50">
                        {(['day1', 'day2'] as const).map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all min-w-[70px]",
                                    activeDay === day
                                        ? "bg-background text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="hidden md:inline">{format(new Date(festDates[day].start), 'MMM d')}</span>
                                <span className="md:hidden">{format(new Date(festDates[day].start), 'MMM d')}</span>
                            </button>
                        ))}
                    </div>
                )}


                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary active:scale-95 transition-all"
                        aria-label="Search"
                    >
                        <Icon icon="solar:magnifer-linear" width={20} />
                    </button>
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary active:scale-95 transition-all relative"
                        aria-label="Notifications"
                    >
                        <Icon icon="solar:bell-bing-linear" width={20} />
                        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-20 scroll-smooth mx-auto w-full",
                isSchedulePage ? "max-w-full" : "max-w-3xl"
            )}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ===== BOTTOM NAVIGATION ===== */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border/40 flex justify-around items-center px-2 z-50 pb-safe max-w-3xl mx-auto">
                {NAV_ITEMS.map(({ key, path, iconLinear, iconBold }) => (
                    <NavLink
                        key={key}
                        to={path}
                        className={({ isActive }) =>
                            cn(
                                'group flex flex-col items-center gap-1 p-2 w-16 transition-all',
                                isActive
                                    ? 'text-primary'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-foreground'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="relative transition-transform duration-200 group-active:scale-90">
                                    <Icon
                                        icon={isActive ? iconBold : iconLinear}
                                        width={24}
                                        className="block transition-all"
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'text-[10px] tracking-tight transition-all duration-200',
                                        isActive ? 'font-bold' : 'font-medium'
                                    )}
                                >
                                    {t(`nav.${key}`)}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}
