import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

export default function HomePage() {
    const { t } = useTranslation()

    return (
        <div className="animate-fade-in">
            {/* Hero Countdown */}
            <div className="px-4 mt-6 mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-glow p-5">
                    {/* Decorative blurs */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-orange-500 opacity-20 rounded-full blur-xl" />

                    <p className="text-xs font-medium text-blue-100 uppercase tracking-wider mb-2 opacity-90">
                        {t('home.festStartsIn')}
                    </p>
                    <div className="flex items-end gap-1 font-mono">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold leading-none">13</span>
                            <span className="text-[10px] opacity-80 mt-1">{t('home.days')}</span>
                        </div>
                        <span className="text-xl font-bold mb-3 opacity-60">:</span>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold leading-none">14</span>
                            <span className="text-[10px] opacity-80 mt-1">{t('home.hours')}</span>
                        </div>
                        <span className="text-xl font-bold mb-3 opacity-60">:</span>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold leading-none">32</span>
                            <span className="text-[10px] opacity-80 mt-1">{t('home.mins')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Events (Carousel) */}
            <div className="mb-8">
                <div className="flex justify-between items-center px-4 mb-3">
                    <h3 className="text-lg font-semibold tracking-tight text-gray-900">{t('home.featuredEvents')}</h3>
                    <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">{t('home.seeAll')}</a>
                </div>

                <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x-mandatory no-scrollbar">
                    {/* Card 1 */}
                    <div className="snap-center shrink-0 w-[280px] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden group active:scale-[0.98] transition-transform duration-200">
                        <div className="h-40 bg-gray-200 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600" alt="Event" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-900 flex items-center gap-1">
                                <Icon icon="solar:fire-bold" className="text-orange-500" /> {t('home.popular')}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">Neon Nights Concert</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1"><Icon icon="solar:calendar-linear" /> Mar 15</span>
                                <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" /> Main Arena</span>
                            </div>
                            <button className="w-full py-2.5 bg-gray-50 hover:bg-primary-50 text-gray-900 hover:text-primary-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-gray-100">
                                {t('home.viewDetails')}
                            </button>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="snap-center shrink-0 w-[280px] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden group active:scale-[0.98] transition-transform duration-200">
                        <div className="h-40 bg-gray-200 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600" alt="Event" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-900 flex items-center gap-1">
                                <Icon icon="solar:code-bold" className="text-purple-500" /> Tech
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">Hackathon 2026</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1"><Icon icon="solar:clock-circle-linear" /> 24 Hours</span>
                                <span className="flex items-center gap-1"><Icon icon="solar:map-point-linear" /> CS Block</span>
                            </div>
                            <button className="w-full py-2.5 bg-gray-50 hover:bg-primary-50 text-gray-900 hover:text-primary-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-gray-100">
                                {t('home.viewDetails')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Explore Grid (4 columns with colored icon squares) */}
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
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between h-28 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Icon icon="solar:calendar-add-linear" width={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">{t('home.mySchedule')}</h4>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{t('home.eventsSaved', { count: 3 })}</p>
                        </div>
                    </div>
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

            {/* Trending Now */}
            <div className="px-4 pb-4">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 mb-4">{t('home.trendingNow')}</h3>
                <div className="flex flex-col gap-3">
                    {/* Trending Item 1 */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=150" className="w-16 h-16 rounded-lg object-cover" alt="Robotics" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">Robotics Workshop</h4>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{t('home.free')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">Learn to build basic bots</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex -space-x-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 border border-white" />
                                    <div className="w-5 h-5 rounded-full bg-gray-300 border border-white" />
                                    <div className="w-5 h-5 rounded-full bg-gray-400 border border-white" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{t('home.going', { count: 124 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Trending Item 2 */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=150" className="w-16 h-16 rounded-lg object-cover" alt="Dance" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">Dance Battle Finals</h4>
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{t('home.fillingFast')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">Semi-classical meets hip-hop</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex -space-x-1.5">
                                    <div className="w-5 h-5 rounded-full bg-purple-200 border border-white" />
                                    <div className="w-5 h-5 rounded-full bg-pink-200 border border-white" />
                                    <div className="w-5 h-5 rounded-full bg-indigo-200 border border-white" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{t('home.going', { count: 89 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
