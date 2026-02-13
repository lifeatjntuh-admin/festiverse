// ===== Profile Roles =====
export type UserRole =
    | 'super_admin'
    | 'app_admin'
    | 'event_manager'
    | 'stall_manager'
    | 'team_member'
    | 'attendee'

export interface ProfilePreferences {
    email_reminders: boolean
    push_notifications: boolean
    theme: 'light' | 'dark'
}

// ===== Profile =====
export interface Profile {
    id: string
    email: string
    name: string
    college_id: string | null
    department: string | null
    phone: string | null
    avatar_url: string | null
    roles: UserRole[] // Supported roles: 'super_admin', 'app_admin', 'event_manager', 'stall_manager', 'team_member', 'attendee'
    role_request: UserRole | null // Requested role
    permissions: Record<string, boolean> // Optional granular overrides
    preferences: ProfilePreferences
    is_deleted: boolean
    deleted_at: string | null
    created_at: string
    updated_at: string
}

// ===== Events =====
export type EventCategory =
    | 'workshop'
    | 'competition'
    | 'cultural'
    | 'tech'
    | 'sports'
    | 'food'

export interface VenueDetails {
    building?: string
    room?: string
    floor?: number
    capacity?: number
}

export interface OrganizerContact {
    email?: string
    phone?: string
    whatsapp?: string
}

export interface Event {
    id: string
    title: string
    description: string | null
    category: EventCategory
    department: string | null
    start_time: string
    end_time: string
    location: string
    venue_details: VenueDetails | null
    image_url: string | null
    images: string[] | null
    organizer_id: string
    organizer_contact: OrganizerContact | null
    registration_required: boolean
    registration_link: string | null
    max_participants: number | null
    current_registrations: number
    is_paid: boolean
    price: number | null
    tags: string[]
    rules: string | null
    is_featured: boolean
    is_published: boolean
    featured_order: number | null
    created_at: string
    updated_at: string
    // Joined fields
    organizer?: Profile
    is_bookmarked?: boolean
    is_registered?: boolean
}

// ===== Stalls =====
export type StallCategory = 'food' | 'merchandise' | 'club' | 'sponsor'

export interface MenuItem {
    name: string
    price: number
    image_url?: string
    description?: string
    available: boolean
}

export interface MapCoordinates {
    x: number
    y: number
    zone?: string
}

export interface Stall {
    id: string
    name: string
    description: string | null
    category: StallCategory
    location: string
    map_coordinates: MapCoordinates | null
    images: string[]
    owner_id: string
    contact_info: OrganizerContact | null
    menu_items: MenuItem[] | null
    is_active: boolean
    featured_position: number | null
    created_at: string
    updated_at: string
    // Joined
    owner?: Profile
}

// ===== Bookmarks =====
export interface Bookmark {
    id: string
    user_id: string
    event_id: string | null
    stall_id: string | null
    type: 'event' | 'stall'
    created_at: string
}

// ===== Registrations =====
export interface EventRegistration {
    id: string
    event_id: string
    user_id: string
    registration_data: Record<string, unknown> | null
    payment_status: 'pending' | 'completed' | 'failed'
    payment_id: string | null
    checked_in: boolean
    checked_in_at: string | null
    created_at: string
}

// ===== Notifications =====
export type NotificationType = 'event_reminder' | 'event_update' | 'announcement' | 'registration_confirmed'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: NotificationType
    related_event_id: string | null
    related_stall_id: string | null
    action_url: string | null
    is_read: boolean
    read_at: string | null
    created_at: string
}

// ===== Announcements =====
export interface Announcement {
    id: string
    title: string
    content: string
    priority: 'urgent' | 'normal' | 'info'
    visible_from: string
    visible_until: string | null
    created_by: string | null
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
