import { Icon } from '@iconify/react'
import { useStallBookmarks } from '@/lib/useData'

export function StallHeartsList({ stallId }: { stallId: string }) {
    const { bookmarks, loading } = useStallBookmarks(stallId)

    if (loading) return (
        <div className="p-4 space-y-2">
            {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-muted rounded-lg animate-pulse" />)}
        </div>
    )

    if (bookmarks.length === 0) return (
        <div className="py-6 text-center">
            <Icon icon="solar:heart-broken-linear" width={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No hearts yet</p>
        </div>
    )

    return (
        <div>
            <div className="px-4 py-2 flex items-center justify-between bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium">{bookmarks.length} people hearted this</span>
            </div>
            <div className="divide-y divide-border max-h-60 overflow-y-auto">
                {bookmarks.map(bm => (
                    <div key={bm.id} className="px-4 py-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {bm.profile?.avatar_url
                                ? <img src={bm.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">{bm.profile?.name?.[0]?.toUpperCase() || '?'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{bm.profile?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{bm.profile?.email}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {new Date(bm.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
