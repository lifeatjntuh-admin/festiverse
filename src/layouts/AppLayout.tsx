import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
    { key: 'home', path: '/', iconLinear: 'solar:home-smile-linear', iconBold: 'solar:home-smile-bold' },
    { key: 'schedule', path: '/schedule', iconLinear: 'solar:calendar-linear', iconBold: 'solar:calendar-bold' },
    { key: 'stalls', path: '/stalls', iconLinear: 'solar:shop-linear', iconBold: 'solar:shop-bold' },
    { key: 'profile', path: '/profile', iconLinear: 'solar:user-circle-linear', iconBold: 'solar:user-circle-bold' },
] as const

export default function AppLayout() {
    const { t } = useTranslation()
    const location = useLocation()

    return (
        <div className="min-h-dvh bg-gray-50 flex flex-col">
            {/* ===== TOP BAR (Glassmorphism) ===== */}
            <header className="sticky top-0 z-40 h-14 glass border-b border-gray-100 flex items-center justify-between px-4 transition-all duration-300">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-display font-bold text-sm tracking-tight shadow-glow">
                        FV
                    </div>
                    <span className="font-display font-semibold text-lg tracking-tight text-gray-900">
                        {t('app.name')}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                        aria-label="Search"
                    >
                        <Icon icon="solar:magnifer-linear" width={20} />
                    </button>
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all relative"
                        aria-label="Notifications"
                    >
                        <Icon icon="solar:bell-bing-linear" width={20} />
                        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-20 scroll-smooth max-w-3xl mx-auto w-full">
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
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex justify-around items-center px-2 z-50 pb-safe max-w-3xl mx-auto">
                {NAV_ITEMS.map(({ key, path, iconLinear, iconBold }) => (
                    <NavLink
                        key={key}
                        to={path}
                        className={({ isActive }) =>
                            cn(
                                'group flex flex-col items-center gap-1 p-2 w-16 transition-all',
                                isActive
                                    ? 'text-primary-600'
                                    : 'text-gray-400 hover:text-gray-600'
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
