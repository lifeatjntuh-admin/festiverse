import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const FILTERS = ['all', 'food', 'merch', 'gaming', 'clubs', 'sponsors'] as const

const SAMPLE_STALLS = [
    { name: 'Biryani House', desc: 'Stall #12 • Food Court', category: 'Food', rating: 4.8, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300', h: 'h-36' },
    { name: 'Bubble Tea Co.', desc: 'Stall #04 • Food Court', category: 'Drink', img: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=300', h: 'h-40' },
    { name: 'Fest Hoodies', desc: 'Stall #21 • Main Entry', category: 'Merch', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300', h: 'h-32' },
    { name: 'VR Zone', desc: 'Stall #08 • Tech Hall', category: 'Fun', img: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=300', h: 'h-28' },
]

export default function StallsPage() {
    const { t } = useTranslation()
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('all')

    return (
        <div className="animate-fade-in">
            {/* Filter Bar */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                            activeFilter === filter
                                ? 'bg-primary-600 text-white shadow-glow'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                        )}
                    >
                        {t(`stalls.${filter}`)}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <div className="px-4 mt-2 columns-2 gap-3 space-y-3">
                {SAMPLE_STALLS.map((stall) => (
                    <div key={stall.name} className="break-inside-avoid bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer">
                        <div className="relative">
                            <img src={stall.img} className={`w-full ${stall.h} object-cover`} alt={stall.name} />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {stall.category}
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="text-sm font-semibold text-gray-900 leading-tight">{stall.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-1 truncate">{stall.desc}</p>
                            {stall.rating && (
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                                        <Icon icon="solar:star-bold" />
                                        <span className="text-gray-500 ml-1 font-medium">{stall.rating}</span>
                                    </div>
                                    <button className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Icon icon="solar:map-arrow-right-linear" width={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
