import { Event } from '@/types/database'

export interface LayoutEvent extends Event {
    top: number
    height: number
    left: number
    width: number
}

// Constants for layout
const HOUR_HEIGHT = 80 // Pixels per hour
const START_HOUR = 0 // Start at 12 AM
const END_HOUR = 24 // End at 12 AM (next day)

/**
 * Calculates position and size for events in a vertical timeline.
 * Handles overlapping events by placing them side-by-side.
 */
export function calculateEventPositions(events: Event[]): LayoutEvent[] {
    if (!events.length) return []

    // 1. Sort events by start time, then duration (longer first)
    const sortedEvents = [...events].sort((a, b) => {
        const startDiff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        if (startDiff !== 0) return startDiff
        const durationA = new Date(a.end_time).getTime() - new Date(a.start_time).getTime()
        const durationB = new Date(b.end_time).getTime() - new Date(b.start_time).getTime()
        return durationB - durationA
    })

    // 2. Expand events with layout properties
    const layoutEvents: any[] = sortedEvents.map(event => {
        const start = new Date(event.start_time)
        const end = new Date(event.end_time)

        // Calculate vertical position
        const startHour = start.getHours() + start.getMinutes() / 60
        const endHour = end.getHours() + end.getMinutes() / 60

        // Relative to START_HOUR
        const top = (startHour - START_HOUR) * HOUR_HEIGHT
        const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 30) // Min height 30px

        return {
            ...event,
            startMs: start.getTime(),
            endMs: end.getTime(),
            top,
            height,
            colIndex: 0, // Assigned later
            totalCols: 1 // Assigned later
        }
    })

    // 3. Group overlapping events (Pack columns)
    // We use a simple greedy approach:
    // Iterate events, find all events that overlap with current.
    // Assign columns.

    // Using a "columns" array to track end time of events in each column
    // But since we want to share width equally, we need to find "clusters" of overlapping events.

    const clusters: any[][] = []
    let currentCluster: any[] = []

    for (const event of layoutEvents) {
        if (currentCluster.length === 0) {
            currentCluster.push(event)
            continue
        }

        // Check if event overlaps with the *entire cluster's range*
        // Actually, simpler: if it overlaps with *any* event in the cluster?
        // Standard Algo:
        // 1. Find overlapping groups.
        // 2. Within group, layout columns.

        const clusterEnd = Math.max(...currentCluster.map(e => e.endMs))

        if (event.startMs < clusterEnd) {
            currentCluster.push(event)
        } else {
            clusters.push(currentCluster)
            currentCluster = [event]
        }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster)

    // 4. Assign columns within clusters
    for (const cluster of clusters) {
        // We need to assign colIndex such that no two overlapping events share a colIndex.
        // And we want to pack them to the left.

        // Sort cluster by start time (already sorted)

        const columns: number[] = [] // Stores end time of last event in each column

        for (const event of cluster) {
            let placed = false
            for (let i = 0; i < columns.length; i++) {
                const colEndTime = columns[i]
                if (colEndTime !== undefined && colEndTime <= event.startMs) {
                    event.colIndex = i
                    columns[i] = event.endMs
                    placed = true
                    break
                }
            }
            if (!placed) {
                event.colIndex = columns.length
                columns.push(event.endMs)
            }
        }

        // 5. Expand width
        // If an event has space to the right, it could expand?
        // For simplicity: width = 100% / maxColumns.
        // Or better: 100% / columns.length (width of the cluster)
        const totalCols = columns.length

        for (const event of cluster) {
            event.left = (event.colIndex / totalCols) * 100
            event.width = 100 / totalCols
        }
    }

    return layoutEvents
}

export { HOUR_HEIGHT, START_HOUR, END_HOUR }
