import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useStalls } from '@/lib/useData'

const FILTERS = ['all', 'food', 'merchandise', 'club', 'sponsor'] as const

// Alternate heights for masonry feel
const HEIGHTS = ['h-36', 'h-40', 'h-32', 'h-28', 'h-36', 'h-32', 'h-40', 'h-28']

const CATEGORY_LABELS: Record<string, string> = {
    food: 'Food',
    merchandise: 'Merch',
    club: 'Club',
    sponsor: 'Sponsor',
}

export default function StallsPage() {
    const { t } = useTranslation()
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('all')

    const { stalls, loading } = useStalls(activeFilter)

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
                        {t(`stalls.${filter}`) || filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <div className="px-4 mt-2 columns-2 gap-3 space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className={`w-full ${HEIGHTS[i]} bg-gray-100 animate-pulse`} />
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    ))
                ) : stalls.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                        <Icon icon="solar:shop-2-linear" className="text-gray-300 mx-auto mb-3" width={48} />
                        <p className="text-sm text-gray-400 font-medium">No stalls in this category</p>
                    </div>
                ) : (
                    stalls.map((stall, i) => (
                        <div
                            key={stall.id}
                            className="break-inside-avoid bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <div className="relative">
                                {stall.images?.[0] && (
                                    <img
                                        src={stall.images[0]}
                                        className={`w-full ${HEIGHTS[i % HEIGHTS.length]} object-cover`}
                                        alt={stall.name}
                                    />
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    {CATEGORY_LABELS[stall.category] || stall.category}
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">{stall.name}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 truncate">{stall.location}</p>
                                {stall.menu_items && Array.isArray(stall.menu_items) && stall.menu_items.length > 0 && (
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {stall.menu_items.length} items
                                        </span>
                                        <button className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <Icon icon="solar:map-arrow-right-linear" width={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
