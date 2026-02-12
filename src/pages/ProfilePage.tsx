import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

export default function ProfilePage() {
    const { t } = useTranslation()

    return (
        <div className="animate-fade-in">
            <div className="p-4 pt-8 text-center">
                {/* Avatar with gradient border */}
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-primary-400 to-secondary-400 mb-3">
                    <div className="w-full h-full rounded-full bg-primary-100 border-4 border-white flex items-center justify-center text-primary-600 text-3xl font-bold font-display">
                        ?
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Guest User</h2>
                <p className="text-sm text-gray-500 font-medium">Sign in to access all features</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 mb-8">
                    {[
                        { label: t('profile.events'), value: '0' },
                        { label: t('profile.saved'), value: '0' },
                        { label: t('profile.points'), value: '0' },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-xl font-bold text-gray-900">{value}</div>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Menu Items */}
                <div className="space-y-3 text-left">
                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Icon icon="solar:ticket-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.myTickets')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Icon icon="solar:bookmark-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.savedEvents')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Icon icon="solar:bell-bing-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.notifications')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center">
                                <Icon icon="solar:settings-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.settings')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>
                </div>

                <button className="mt-8 text-sm font-semibold text-red-500 py-2">
                    {t('profile.signOut')}
                </button>
            </div>
        </div>
    )
}
