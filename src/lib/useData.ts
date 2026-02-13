import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import type { Event, Stall, Bookmark, EventRegistration, Profile } from '@/types/database'

// ===== Events Hooks =====

/** Fetch featured events (ordered by featured_order) */
export function useFeaturedEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase
            .from('events')
            .select('*')
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

    // Fest days: Day 1 = March 15, Day 2 = March 16
    const dateMap = {
        day1: { start: '2026-03-15T00:00:00+05:30', end: '2026-03-15T23:59:59+05:30' },
        day2: { start: '2026-03-16T00:00:00+05:30', end: '2026-03-16T23:59:59+05:30' },
    }

    useEffect(() => {
        setLoading(true)
        setError(null)
        const { start, end } = dateMap[day]

        supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true })
            .then(({ data, error: err }) => {
                if (err) {
                    console.error('Failed to fetch events by day:', err)
                    setError(err.message)
                } else {
                    setEvents((data ?? []) as Event[])
                }
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            .select('*')
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

// ===== Organiser Hooks =====

/** Fetch events owned by a specific user */
export function useMyEvents(userId: string | undefined) {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('events')
            .select('*')
            .eq('organizer_id', userId)
            .order('start_time', { ascending: true })
            .then(({ data }) => {
                setEvents((data ?? []) as Event[])
                setLoading(false)
            })
    }, [userId])

    useEffect(() => { refresh() }, [refresh])

    return { events, loading, refresh, setEvents }
}

/** Fetch stalls owned by a specific user */
export function useMyStalls(userId: string | undefined) {
    const [stalls, setStalls] = useState<Stall[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('stalls')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setStalls((data ?? []) as Stall[])
                setLoading(false)
            })
    }, [userId])

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

/** Fetch team members for an event (profiles that have team_member role and are linked) */
export function useEventTeam(eventId: string | undefined) {
    const [members, setMembers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        if (!eventId) { setLoading(false); return }
        setLoading(true)
        supabase
            .from('event_team_members')
            .select('*, profiles:user_id(id, name, email, avatar_url, phone)')
            .eq('event_id', eventId)
            .then(({ data, error }) => {
                if (error) {
                    // Table might not exist yet
                    console.warn('event_team_members query failed:', error.message)
                    setMembers([])
                } else {
                    setMembers((data ?? []).map((r: any) => r.profiles).filter(Boolean))
                }
                setLoading(false)
            })
    }, [eventId])

    useEffect(() => { refresh() }, [refresh])

    const addMember = async (userId: string) => {
        const { error } = await supabase
            .from('event_team_members')
            .insert({ event_id: eventId, user_id: userId })
        if (!error) refresh()
        return { error }
    }

    const removeMember = async (userId: string) => {
        const { error } = await supabase
            .from('event_team_members')
            .delete()
            .eq('event_id', eventId!)
            .eq('user_id', userId)
        if (!error) refresh()
        return { error }
    }

    return { members, loading, refresh, addMember, removeMember }
}
