import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useStalls, useBookmarks } from '@/lib/useData'
import { useAuthStore } from '@/lib/useAuthStore'
import toast from 'react-hot-toast'

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
    const { user } = useAuthStore()
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('all')
    const { bookmarks, isStallBookmarked, toggleStallBookmark } = useBookmarks(user?.uid)

    const viewMode = searchParams.get('view') as 'saved' | null
    const { stalls, loading } = useStalls(activeFilter)

    // Filter stalls in saved view
    const savedStallIds = bookmarks.filter(b => b.type === 'stall').map(b => b.stall_id)
    const displayStalls = viewMode === 'saved'
        ? stalls.filter(s => savedStallIds.includes(s.id))
        : stalls

    const handleStallBookmark = async (stallId: string) => {
        if (!user) {
            toast('Please sign in to bookmark', { icon: '🔒' })
            return
        }
        const nowBookmarked = await toggleStallBookmark(stallId)
        toast.success(nowBookmarked ? 'Stall saved! ⭐' : 'Removed from saved')
    }

    return (
        <div className="animate-fade-in">
            {viewMode === 'saved' ? (
                <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:heart-bold" width={18} className="text-red-500" />
                        <h3 className="text-sm font-bold text-card-foreground">Saved Stalls</h3>
                    </div>
                    <button
                        onClick={() => setSearchParams({})}
                        className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 active:scale-95 transition-transform"
                    >
                        Show All
                    </button>
                </div>
            ) : (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                                activeFilter === filter
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
                            )}
                        >
                            {t(`stalls.${filter}`) || filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {/* Masonry Grid */}
            <div className="px-4 mt-2 columns-2 gap-3 space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className={`w-full ${HEIGHTS[i]} bg-muted animate-pulse`} />
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    ))
                ) : displayStalls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in col-span-full">
                        <Icon icon={viewMode === 'saved' ? 'solar:heart-broken-linear' : 'solar:shop-2-linear'} className="text-muted-foreground mx-auto mb-3" width={48} />
                        <p className="text-sm text-muted-foreground font-medium">{viewMode === 'saved' ? 'No saved stalls yet' : 'No stalls in this category'}</p>
                    </div>
                ) : (
                    displayStalls.map((stall, i) => (
                        <div
                            key={stall.id}
                            className="break-inside-avoid bg-card rounded-xl border border-border shadow-sm overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
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
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStallBookmark(stall.id) }}
                                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                                >
                                    <Icon
                                        icon={isStallBookmarked(stall.id) ? 'solar:heart-bold' : 'solar:heart-linear'}
                                        width={16}
                                        className={isStallBookmarked(stall.id) ? 'text-red-500' : 'text-gray-600'}
                                    />
                                </button>
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-semibold text-card-foreground leading-tight">{stall.name}</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{stall.location}</p>
                                {stall.menu_items && Array.isArray(stall.menu_items) && stall.menu_items.length > 0 && (
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {stall.menu_items.length} items
                                        </span>
                                        <button className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
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
