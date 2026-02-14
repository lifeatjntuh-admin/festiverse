import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
    const { t } = useTranslation()
    return (
        <div className="min-h-dvh bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Floating decorative blobs */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-center relative z-10 max-w-sm"
            >
                {/* Animated 404 icon */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="mb-6"
                >
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Icon icon="solar:map-point-wave-bold" width={56} className="text-white/80" />
                    </div>
                </motion.div>

                {/* 404 text */}
                <h1 className="text-8xl font-bold text-white font-display tracking-tight mb-2 drop-shadow-lg">
                    404
                </h1>
                <h2 className="text-xl font-bold text-white/90 font-display mb-3">
                    {t('notFound.title')}
                </h2>
                <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
                    {t('notFound.paragraph')}
                </p>

                {/* Action buttons */}
                <div className="space-y-3">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2.5 bg-white text-primary-600 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                    >
                        <Icon icon="solar:home-smile-bold" width={18} />
                        {t('notFound.backToHome')}
                    </Link>
                    <Link
                        to="/schedule"
                        className="w-full flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
                    >
                        <Icon icon="solar:calendar-bold" width={18} />
                        {t('notFound.viewSchedule')}
                    </Link>
                </div>

                {/* Fun confetti dots */}
                <div className="mt-10 flex items-center justify-center gap-2">
                    {['bg-secondary-400', 'bg-accent-purple', 'bg-accent-green', 'bg-accent-pink', 'bg-accent-yellow'].map(
                        (color, i) => (
                            <motion.div
                                key={color}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    ease: 'easeInOut',
                                }}
                                className={`w-2 h-2 rounded-full ${color}`}
                            />
                        )
                    )}
                </div>
            </motion.div>
        </div>
    )
}
