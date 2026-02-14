import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import type { Event, Stall, Bookmark, EventRegistration, Profile, UserRole, FestDates } from '@/types/database'

export const DEFAULT_FEST_DATES: FestDates = {
    day1: { start: '2026-03-15T00:00:00+05:30', end: '2026-03-15T23:59:59+05:30' },
    day2: { start: '2026-03-16T00:00:00+05:30', end: '2026-03-16T23:59:59+05:30' },
}

// ===== Events Hooks =====

/** Fetch featured events (ordered by featured_order) */
export function useFeaturedEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase
            .from('events')
            .select('*, bookmarks(count), event_registrations(count)')
            .eq('is_featured', true)
            .eq('is_published', true)
            .order('featured_order', { ascending: true })
            .then(({ data, error: err }) => {
                if (err) {
                    console.error('Failed to fetch featured events:', err)
                    setError(err.message)
                } else {
                    setEvents((data ?? []) as Event[])
                }
                setLoading(false)
            })
    }, [])

    return { events, loading, error }
}

/** Fetch events by day (for SchedulePage timeline) */
export function useEventsByDay(day: 'day1' | 'day2') {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)

        const fetchDatesAndEvents = async () => {
            // 1. Get dates
            let dateMap = DEFAULT_FEST_DATES
            const { data: settings } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'fest_dates')
                .single()

            if (settings?.value) {
                dateMap = settings.value as FestDates
            }

            const { start, end } = dateMap[day]

            // 2. Get events
            const { data, error: err } = await supabase
                .from('events')
                .select('*, bookmarks(count), event_registrations(count)')
                .eq('is_published', true)
                .gte('start_time', start)
                .lte('start_time', end)
                .order('start_time', { ascending: true })

            if (err) {
                console.error('Failed to fetch events by day:', err)
                setError(err.message)
            } else {
                setEvents((data ?? []) as Event[])
            }
            setLoading(false)
        }

        fetchDatesAndEvents()
    }, [day])

    return { events, loading, error }
}

/** Fetch all published events */
export function useAllEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase
            .from('events')
            .select('*, bookmarks(count), event_registrations(count)')
            .eq('is_published', true)
            .order('start_time', { ascending: true })
            .then(({ data, error: err }) => {
                if (err) {
                    console.error('Failed to fetch all events:', err)
                    setError(err.message)
                } else {
                    setEvents((data ?? []) as Event[])
                }
                setLoading(false)
            })
    }, [])

    return { events, loading, error }
}

// ===== Stalls Hooks =====

/** Fetch all active stalls */
export function useStalls(category?: string) {
    const [stalls, setStalls] = useState<Stall[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        let query = supabase
            .from('stalls')
            .select('*')
            .eq('is_active', true)
            .order('featured_position', { ascending: true, nullsFirst: false })

        if (category && category !== 'all') {
            query = query.eq('category', category)
        }

        query.then(({ data, error: err }) => {
            if (err) {
                console.error('Failed to fetch stalls:', err)
                setError(err.message)
            } else {
                setStalls((data ?? []) as Stall[])
            }
            setLoading(false)
        })
    }, [category])

    return { stalls, loading, error }
}

// ===== Bookmark Hooks =====

/** Fetch user bookmarks and provide toggle functions for events and stalls */
export function useBookmarks(userId: string | undefined) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBookmarks = useCallback(async () => {
        if (!userId) {
            setBookmarks([])
            setLoading(false)
            return
        }
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', userId)

        if (error) {
            console.error('Failed to fetch bookmarks:', error.message, error.details)
        } else {
            setBookmarks((data ?? []) as Bookmark[])
        }
        setLoading(false)
    }, [userId])

    useEffect(() => {
        fetchBookmarks()
    }, [fetchBookmarks])

    // ---- Event bookmarks ----
    const isBookmarked = (eventId: string) =>
        bookmarks.some((b) => b.event_id === eventId && b.type === 'event')

    const toggleBookmark = async (eventId: string): Promise<boolean> => {
        if (!userId) return false

        const existing = bookmarks.find((b) => b.event_id === eventId && b.type === 'event')

        if (existing) {
            setBookmarks((prev) => prev.filter((b) => b.id !== existing.id))
            const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id)
            if (error) {
                setBookmarks((prev) => [...prev, existing])
                return false
            }
            return false
        } else {
            const optimistic: Bookmark = {
                id: crypto.randomUUID(),
                user_id: userId,
                event_id: eventId,
                stall_id: null,
                type: 'event',
                created_at: new Date().toISOString(),
            }
            setBookmarks((prev) => [...prev, optimistic])

            const { data, error } = await supabase
                .from('bookmarks')
                .insert({ user_id: userId, event_id: eventId, type: 'event' })
                .select()
                .single()

            if (error) {
                setBookmarks((prev) => prev.filter((b) => b.id !== optimistic.id))
                return false
            }
            setBookmarks((prev) =>
                prev.map((b) => (b.id === optimistic.id ? (data as Bookmark) : b))
            )
            return true
        }
    }

    // ---- Stall bookmarks ----
    const isStallBookmarked = (stallId: string) =>
        bookmarks.some((b) => b.stall_id === stallId && b.type === 'stall')

    const toggleStallBookmark = async (stallId: string): Promise<boolean> => {
        if (!userId) return false

        const existing = bookmarks.find((b) => b.stall_id === stallId && b.type === 'stall')

        if (existing) {
            setBookmarks((prev) => prev.filter((b) => b.id !== existing.id))
            const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id)
            if (error) {
                setBookmarks((prev) => [...prev, existing])
                return false
            }
            return false
        } else {
            const optimistic: Bookmark = {
                id: crypto.randomUUID(),
                user_id: userId,
                event_id: null,
                stall_id: stallId,
                type: 'stall',
                created_at: new Date().toISOString(),
            }
            setBookmarks((prev) => [...prev, optimistic])

            const { data, error } = await supabase
                .from('bookmarks')
                .insert({ user_id: userId, stall_id: stallId, type: 'stall' })
                .select()
                .single()

            if (error) {
                setBookmarks((prev) => prev.filter((b) => b.id !== optimistic.id))
                return false
            }
            setBookmarks((prev) =>
                prev.map((b) => (b.id === optimistic.id ? (data as Bookmark) : b))
            )
            return true
        }
    }

    const bookmarkCount = bookmarks.filter((b) => b.type === 'event').length

    return { bookmarks, loading, isBookmarked, toggleBookmark, isStallBookmarked, toggleStallBookmark, bookmarkCount }
}

/** Fetch who bookmarked a stall */
export function useStallBookmarks(stallId: string | undefined) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!stallId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('bookmarks')
            .select('*, profile:user_id(*)')
            .eq('stall_id', stallId)
            .eq('type', 'stall')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.warn('stall bookmarks query failed:', error.message)
                    setBookmarks([])
                } else {
                    setBookmarks((data ?? []) as Bookmark[])
                }
                setLoading(false)
            })
    }, [stallId])

    useEffect(() => { refresh() }, [refresh])

    return { bookmarks, loading, refresh }
}

// ===== Self-Registration Hook =====

/** Let user self-mark whether they registered for an event */
export function useRegistration(userId: string | undefined, eventId: string | undefined) {
    const [isRegistered, setIsRegistered] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        if (!userId || !eventId) {
            setLoading(false)
            return
        }
        supabase
            .from('event_registrations')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .maybeSingle()
            .then(({ data }) => {
                setIsRegistered(!!data)
                setLoading(false)
            })
    }, [userId, eventId])

    const toggleRegistration = async (): Promise<boolean> => {
        if (!userId || !eventId || toggling) return isRegistered

        setToggling(true)

        if (isRegistered) {
            // Remove registration
            setIsRegistered(false)
            const { error } = await supabase
                .from('event_registrations')
                .delete()
                .eq('user_id', userId)
                .eq('event_id', eventId)
            if (error) {
                console.error('Failed to remove registration:', error)
                setIsRegistered(true)
            }
        } else {
            // Add registration
            setIsRegistered(true)
            const { error } = await supabase
                .from('event_registrations')
                .insert({
                    event_id: eventId,
                    user_id: userId,
                    payment_status: 'completed',
                    checked_in: false,
                })
            if (error) {
                console.error('Failed to add registration:', error)
                setIsRegistered(false)
            }
        }

        setToggling(false)
        return !isRegistered
    }

    return { isRegistered, loading, toggling, toggleRegistration }
}

// ===== User Stats Hook =====

/** Fetch quick stats for profile page */
export function useUserStats(userId: string | undefined) {
    const [stats, setStats] = useState({ eventsRegistered: 0, bookmarked: 0, stallsVisited: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        Promise.all([
            supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),
            supabase
                .from('bookmarks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('type', 'event'),
            supabase
                .from('bookmarks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('type', 'stall'),
        ]).then(([regResult, bmResult, stallResult]) => {
            setStats({
                eventsRegistered: regResult.count ?? 0,
                bookmarked: bmResult.count ?? 0,
                stallsVisited: stallResult.count ?? 0,
            })
            setLoading(false)
        })
    }, [userId])

    return { stats, loading }
}

// ===== Profile Search =====

// ===== Profile Search =====

/** Search profiles by name or email (admin/manager only) */
export function useSearchProfiles(query: string) {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!query || query.length < 2) {
            setProfiles([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
                .limit(10)

            if (error) {
                console.error('Search failed:', error)
            } else {
                setProfiles((data ?? []) as Profile[])
            }
            setLoading(false)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query])

    return { profiles, loading }
}

// ===== Organiser Hooks =====

/** Fetch events owned by a specific user (or all if admin, or team events) */
export function useMyEvents(userId: string | undefined, roles: UserRole[] = []) {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Use a ref for roles to prevent deep dependency issues if roles array ref changes
    const rolesRef = useRef(roles)
    useEffect(() => { rolesRef.current = roles }, [roles])

    const refresh = useCallback(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)

        const isSuperAdmin = rolesRef.current.includes('super_admin') || rolesRef.current.includes('app_admin')

        const fetchEvents = async () => {
            if (isSuperAdmin) {
                // Admin: Fetch ALL events + My Team Roles
                const [allEventsRes, teamRes] = await Promise.all([
                    supabase.from('events').select('*, organizer:organizer_id(*)').order('start_time', { ascending: true }),
                    supabase.from('event_team_members').select('event_id, role').eq('user_id', userId)
                ])

                const teamMap = new Map((teamRes.data ?? []).map((t: any) => [t.event_id, t.role]))

                const events = (allEventsRes.data ?? []).map((e: any) => {
                    let relation: 'owner' | 'co_host' | 'member' | 'admin' = 'admin'
                    if (e.organizer_id === userId) relation = 'owner'
                    else if (teamMap.has(e.id)) relation = teamMap.get(e.id) as any

                    return { ...e, user_relation: relation }
                })

                setEvents(events as Event[])
                setLoading(false)
            } else {
                // Normal: Fetch Owned + Team
                const [ownedRes, teamRes] = await Promise.all([
                    supabase.from('events').select('*, organizer:organizer_id(*)').eq('organizer_id', userId),
                    supabase.from('event_team_members').select('event_id, role, events(*, organizer:organizer_id(*))').eq('user_id', userId)
                ])

                const owned = (ownedRes.data ?? []).map((e: any) => ({ ...e, user_relation: 'owner' })) as Event[]

                const team = (teamRes.data ?? []).map((r: any) => {
                    if (!r.events) return null
                    return { ...r.events, user_relation: r.role }
                }).filter(Boolean) as Event[]

                // Deduplicate (Owner takes precedence)
                const combined = [...owned, ...team].reduce((acc, current) => {
                    const existing = acc.find(item => item.id === current.id);
                    if (!existing) {
                        return acc.concat([current]);
                    } else {
                        // If we already have it, prioritize 'owner'
                        if (current.user_relation === 'owner') {
                            return acc.map(i => i.id === current.id ? current : i)
                        }
                        return acc;
                    }
                }, [] as Event[]).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

                setEvents(combined)
                setLoading(false)
            }
        }

        fetchEvents()
    }, [userId])

    useEffect(() => { refresh() }, [refresh])

    return { events, loading, refresh, setEvents }
}

/** Fetch stalls owned by a specific user (or all if admin) */
export function useMyStalls(userId: string | undefined, roles: UserRole[] = []) {
    const [stalls, setStalls] = useState<Stall[]>([])

    const [loading, setLoading] = useState(true)

    const rolesRef = useRef(roles)
    useEffect(() => { rolesRef.current = roles }, [roles])

    const refresh = useCallback(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)

        const isSuperAdmin = rolesRef.current.includes('super_admin') || rolesRef.current.includes('app_admin')

        const fetchStalls = async () => {
            if (isSuperAdmin) {
                // Admin: Fetch ALL stalls + My Team Roles
                const [allStallsRes, teamRes] = await Promise.all([
                    supabase.from('stalls').select('*, owner:owner_id(*), bookmarks(count)').order('created_at', { ascending: false }),
                    supabase.from('stall_team_members').select('stall_id, role').eq('user_id', userId)
                ])

                const teamMap = new Map((teamRes.data ?? []).map((t: any) => [t.stall_id, t.role]))

                const stalls = (allStallsRes.data ?? []).map((s: any) => {
                    let relation: 'owner' | 'co_host' | 'member' | 'admin' = 'admin'
                    if (s.owner_id === userId) relation = 'owner'
                    else if (teamMap.has(s.id)) relation = teamMap.get(s.id) as any

                    return { ...s, user_relation: relation }
                })

                setStalls(stalls as Stall[])
                setLoading(false)
            } else {
                // Normal: Fetch Owned + Team
                const [ownedRes, teamRes] = await Promise.all([
                    supabase.from('stalls').select('*, owner:owner_id(*), bookmarks(count)').eq('owner_id', userId),
                    supabase.from('stall_team_members').select('stall_id, role, stalls(*, owner:owner_id(*), bookmarks(count))').eq('user_id', userId)
                ])

                const owned = (ownedRes.data ?? []).map((s: any) => ({ ...s, user_relation: 'owner' })) as Stall[]

                const team = (teamRes.data ?? []).map((r: any) => {
                    if (!r.stalls) return null
                    return { ...r.stalls, user_relation: r.role }
                }).filter(Boolean) as Stall[]

                // Deduplicate
                const combined = [...owned, ...team].reduce((acc, current) => {
                    const existing = acc.find(item => item.id === current.id);
                    if (!existing) {
                        return acc.concat([current]);
                    } else {
                        if (current.user_relation === 'owner') return acc.map(i => i.id === current.id ? current : i)
                        return acc
                    }
                }, [] as Stall[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                setStalls(combined)
                setLoading(false)
            }
        }

        fetchStalls()
    }, [userId]) // Removed isSuperAdmin from dependency as it is derived from ref

    useEffect(() => { refresh() }, [refresh])

    return { stalls, loading, refresh, setStalls }
}

/** Fetch registrations for a specific event, with user profile data */
export function useEventRegistrations(eventId: string | undefined) {
    const [registrations, setRegistrations] = useState<(EventRegistration & { profile?: Profile })[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!eventId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('event_registrations')
            .select('*, profiles:user_id(id, name, email, avatar_url, phone, college_id)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                const mapped = (data ?? []).map((r: any) => ({
                    ...r,
                    profile: r.profiles ?? undefined,
                }))
                setRegistrations(mapped)
                setLoading(false)
            })
    }, [eventId])

    useEffect(() => { refresh() }, [refresh])

    const toggleCheckIn = async (regId: string, currentValue: boolean) => {
        // Optimistic
        setRegistrations(prev => prev.map(r =>
            r.id === regId
                ? { ...r, checked_in: !currentValue, checked_in_at: !currentValue ? new Date().toISOString() : null }
                : r
        ))
        const { error } = await supabase
            .from('event_registrations')
            .update({ checked_in: !currentValue, checked_in_at: !currentValue ? new Date().toISOString() : null })
            .eq('id', regId)
        if (error) {
            // Revert
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, checked_in: currentValue, checked_in_at: currentValue ? r.checked_in_at : null } : r
            ))
        }
    }

    return { registrations, loading, refresh, toggleCheckIn }
}

// ===== Event CRUD =====

export async function createEvent(eventData: Partial<Event>) {
    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()
    return { data: data as Event | null, error }
}

export async function updateEvent(eventId: string, updates: Partial<Event>) {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single()
    return { data: data as Event | null, error }
}

export async function toggleEventPublish(eventId: string, isPublished: boolean) {
    return supabase
        .from('events')
        .update({ is_published: !isPublished })
        .eq('id', eventId)
}

export async function toggleStallActive(stallId: string, isActive: boolean) {
    return supabase
        .from('stalls')
        .update({ is_active: !isActive })
        .eq('id', stallId)
}

export async function createStall(stallData: Partial<Stall>) {
    const { data, error } = await supabase
        .from('stalls')
        .insert(stallData)
        .select()
        .single()
    return { data: data as Stall | null, error }
}

export async function updateStall(stallId: string, updates: Partial<Stall>) {
    const { data, error } = await supabase
        .from('stalls')
        .update(updates)
        .eq('id', stallId)
        .select()
        .single()
    return { data: data as Stall | null, error }
}

/** Fetch team members for an event */
import type { EventTeamMember } from '@/types/database'

export function useEventTeam(eventId: string | undefined) {
    const [members, setMembers] = useState<EventTeamMember[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!eventId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('event_team_members')
            .select('*, profile:user_id(*)')
            .eq('event_id', eventId)
            .then(({ data, error }) => {
                if (error) {
                    console.warn('event_team_members query failed:', error.message)
                    setMembers([])
                } else {
                    setMembers((data ?? []) as EventTeamMember[])
                }
                setLoading(false)
            })
    }, [eventId])

    useEffect(() => { refresh() }, [refresh])

    const addMember = async (userId: string, role: 'co_host' | 'member' = 'member') => {
        // Check if already a member locally (to avoid RPC call)
        if (members.some(m => m.user_id === userId)) {
            return { error: { message: 'User is already a member of this team' } }
        }

        const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid

        if (!executorId || !eventId) return { error: { message: 'Not authenticated or invalid event' } }

        const { error } = await supabase.rpc('add_event_team_member', {
            executor_id: executorId,
            target_event_id: eventId,
            target_user_id: userId,
            target_role: role
        })

        if (error) {
            // Handle unique constraint violation (duplicate member)
            if (error.code === '23505') {
                return { error: { message: 'User is already a member of this team' } }
            }
            return { error }
        }

        refresh()
        return { error: null }
    }

    const removeMember = async (userId: string) => {
        const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid

        if (!executorId || !eventId) return { error: { message: 'Not authenticated or invalid event' } }

        const { error } = await supabase.rpc('remove_event_team_member', {
            executor_id: executorId,
            target_event_id: eventId,
            target_user_id: userId
        })
        if (!error) refresh()
        return { error }
    }

    const leaveTeam = async () => {
        const userId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid
        if (!userId || !eventId) return { error: { message: 'Not authenticated or invalid event' } }

        const { error } = await supabase.rpc('leave_event_team', {
            target_event_id: eventId,
            target_user_id: userId
        })

        // Refresh valid events/stalls lists might be needed in UI, but here we just return
        return { error }
    }

    return { members, loading, refresh, addMember, removeMember, leaveTeam }
}

/** Fetch team members for a stall */
import type { StallTeamMember } from '@/types/database'

export function useStallTeam(stallId: string | undefined) {
    const [members, setMembers] = useState<StallTeamMember[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!stallId) { setLoading(false); return }
        setLoading(true)

        const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid

        if (!executorId) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .rpc('get_stall_team_members', {
                executor_id: executorId,
                target_stall_id: stallId
            })
            .select('*, profile:user_id(*)')

        if (error) {
            console.warn('stall_team_members query failed:', error.message)
            setMembers([])
        } else {
            setMembers((data ?? []) as StallTeamMember[])
        }
        setLoading(false)
    }, [stallId])

    useEffect(() => { refresh() }, [refresh])

    const addMember = async (userId: string, role: 'co_host' | 'member' = 'member') => {
        // Check if already a member locally (to avoid RPC call)
        if (members.some(m => m.user_id === userId)) {
            return { error: { message: 'User is already a member of this team' } }
        }

        const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid

        if (!executorId || !stallId) return { error: { message: 'Not authenticated or invalid stall' } }

        const { error } = await supabase.rpc('add_stall_team_member', {
            executor_id: executorId,
            target_stall_id: stallId,
            target_user_id: userId,
            target_role: role
        })

        if (error) {
            // Handle unique constraint violation (duplicate member)
            if (error.code === '23505') {
                return { error: { message: 'User is already a member of this team' } }
            }
            return { error }
        }

        refresh()
        return { error: null }
    }

    const removeMember = async (userId: string) => {
        const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid

        if (!executorId || !stallId) return { error: { message: 'Not authenticated or invalid stall' } }

        const { error } = await supabase.rpc('remove_stall_team_member', {
            executor_id: executorId,
            target_stall_id: stallId,
            target_user_id: userId
        })
        if (!error) refresh()
        return { error }
    }

    const leaveTeam = async () => {
        const userId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid
        if (!userId || !stallId) return { error: { message: 'Not authenticated or invalid stall' } }

        const { error } = await supabase.rpc('leave_stall_team', {
            target_stall_id: stallId,
            target_user_id: userId
        })
        return { error }
    }

    return { members, loading, refresh, addMember, removeMember, leaveTeam }
}

// ===== App Settings =====

export function useFestDates() {
    const [dates, setDates] = useState<FestDates | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'fest_dates')
            .single()

        if (data?.value) {
            setDates(data.value as FestDates)
        } else {
            setDates(DEFAULT_FEST_DATES)
        }
        setLoading(false)
    }, [])

    useEffect(() => { refresh() }, [refresh])

    return { dates, loading, refresh }
}

export async function updateFestDates(dates: FestDates) {
    const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid
    if (!executorId) return { error: { message: 'Not authenticated' } }

    return supabase.rpc('update_fest_dates', {
        executor_id: executorId,
        new_dates: dates
    })
}

