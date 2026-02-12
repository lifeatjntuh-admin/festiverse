// ===== Fest Config =====
export interface FestConfig {
    id: string
    fest_name: string
    fest_start: string
    fest_end: string
    is_initialized: boolean
    super_admin_id: string | null
    created_at: string
    updated_at: string
}

// ===== Roles =====
export type EventRole = 'owner' | 'member' | null
export type StallRole = 'owner' | 'member' | null
export type AttendeeOrigin = 'internal' | 'external'
export type AttendeeType = 'student' | 'non_student'

export interface ProfileRoles {
    is_super_admin: boolean
    is_admin: boolean
    event_role: EventRole
    stall_role: StallRole
}

export interface AttendeeInfo {
    origin: AttendeeOrigin
    type: AttendeeType
}

// ===== Profile =====
export interface Profile {
    id: string
    email: string
    name: string
    avatar_url: string | null
    bio: string | null
    college: string | null
    roles: ProfileRoles
    attendee_info: AttendeeInfo | null
    created_at: string
    updated_at: string
}

// ===== Events =====
export type EventCategory =
    | 'music'
    | 'tech'
    | 'food'
    | 'games'
    | 'cultural'
    | 'sports'
    | 'workshop'
    | 'competition'

export interface Event {
    id: string
    title: string
    description: string | null
    category: EventCategory
    start_time: string
    end_time: string
    location: string
    venue_details: Record<string, unknown> | null
    image_url: string | null
    organizer_id: string
    max_participants: number | null
    registration_count: number
    is_featured: boolean
    is_free: boolean
    entry_fee: number | null
    tags: string[]
    status: 'draft' | 'published' | 'cancelled'
    created_at: string
    updated_at: string
    // Joined fields
    organizer?: Profile
    is_bookmarked?: boolean
    is_registered?: boolean
}

// ===== Stalls =====
export type StallCategory = 'food' | 'merch' | 'gaming' | 'clubs' | 'sponsors'

export interface Stall {
    id: string
    name: string
    description: string | null
    category: StallCategory
    location: string
    image_url: string | null
    owner_id: string
    rating: number | null
    is_featured: boolean
    tags: string[]
    status: 'draft' | 'published'
    created_at: string
    updated_at: string
    // Joined
    owner?: Profile
}

// ===== Bookmarks =====
export interface Bookmark {
    id: string
    user_id: string
    event_id: string
    created_at: string
}

// ===== Registrations =====
export interface EventRegistration {
    id: string
    user_id: string
    event_id: string
    status: 'confirmed' | 'waitlisted' | 'cancelled'
    created_at: string
}

// ===== Notifications =====
export type NotificationType = 'event_reminder' | 'registration' | 'announcement' | 'system'

export interface Notification {
    id: string
    user_id: string
    title: string
    body: string
    type: NotificationType
    is_read: boolean
    data: Record<string, unknown> | null
    created_at: string
}

// ===== Announcements =====
export interface Announcement {
    id: string
    title: string
    body: string
    author_id: string
    is_pinned: boolean
    created_at: string
}

// ===== Filters =====
export interface EventFilters {
    category: EventCategory | 'all'
    date: string | null
    search: string
}

export interface StallFilters {
    category: StallCategory | 'all'
    search: string
}
