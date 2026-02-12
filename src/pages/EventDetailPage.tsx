import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

export default function EventDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()

    return (
        <div className="animate-fade-in">
            {/* Hero Image */}
            <div className="w-full h-56 bg-gradient-to-br from-primary-400 to-primary-600 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
                        Tech
                    </span>
                    <h1 className="text-2xl font-bold text-white font-display mt-2">
                        Hackathon 2026
                    </h1>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 -mt-5 relative z-10">
                <button className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm shadow-glow press-effect">
                    {t('event.register')}
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-soft border border-gray-100 press-effect">
                    <Icon icon="solar:bookmark-linear" width={20} className="text-gray-500" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-soft border border-gray-100 press-effect">
                    <Icon icon="solar:share-linear" width={20} className="text-gray-500" />
                </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-6">
                {[
                    { icon: 'solar:calendar-linear', label: t('event.date'), value: 'Feb 26, 2026' },
                    { icon: 'solar:clock-circle-linear', label: t('event.time'), value: '10:00 AM' },
                    { icon: 'solar:map-point-linear', label: t('event.venue'), value: 'Main Hall' },
                    { icon: 'solar:users-group-rounded-linear', label: t('event.registrations', { count: 0 }), value: '0/100' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <Icon icon={icon} width={16} className="text-primary-500 mb-1" />
                        <div className="text-xs text-gray-400">{label}</div>
                        <div className="text-sm font-semibold text-gray-800">{value}</div>
                    </div>
                ))}
            </div>

            {/* Description */}
            <div className="px-4 mt-6 pb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Join us for the most exciting hackathon of the year! Build innovative solutions,
                    collaborate with talented peers, and compete for amazing prizes. Open to all departments.
                </p>
            </div>

            {/* Debug */}
            <span className="hidden">{id}</span>
        </div>
    )
}
