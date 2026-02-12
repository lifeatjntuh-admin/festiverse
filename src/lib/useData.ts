import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Event, Stall } from '@/types/database'

// ===== Events Hooks =====

/** Fetch featured events (ordered by featured_order) */
export function useFeaturedEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('events')
            .select('*')
            .eq('is_featured', true)
            .eq('is_published', true)
            .order('featured_order', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setEvents(data as Event[])
                setLoading(false)
            })
    }, [])

    return { events, loading }
}

/** Fetch events by day (for SchedulePage timeline) */
export function useEventsByDay(day: 'day1' | 'day2') {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Fest days: Day 1 = March 15, Day 2 = March 16
    const dateMap = {
        day1: { start: '2026-03-15T00:00:00+05:30', end: '2026-03-15T23:59:59+05:30' },
        day2: { start: '2026-03-16T00:00:00+05:30', end: '2026-03-16T23:59:59+05:30' },
    }

    useEffect(() => {
        setLoading(true)
        const { start, end } = dateMap[day]

        supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setEvents(data as Event[])
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [day])

    return { events, loading }
}

/** Fetch all published events */
export function useAllEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .order('start_time', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setEvents(data as Event[])
                setLoading(false)
            })
    }, [])

    return { events, loading }
}

// ===== Stalls Hooks =====

/** Fetch all active stalls */
export function useStalls(category?: string) {
    const [stalls, setStalls] = useState<Stall[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        let query = supabase
            .from('stalls')
            .select('*')
            .eq('is_active', true)
            .order('featured_position', { ascending: true, nullsFirst: false })

        if (category && category !== 'all') {
            query = query.eq('category', category)
        }

        query.then(({ data, error }) => {
            if (!error && data) setStalls(data as Stall[])
            setLoading(false)
        })
    }, [category])

    return { stalls, loading }
}
