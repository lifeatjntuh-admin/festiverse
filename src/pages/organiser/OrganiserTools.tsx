import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/lib/useAuthStore'
import {
    useMyEvents,
    useMyStalls,
    useEventRegistrations,
    toggleEventPublish,
    toggleStallActive,
    createEvent,
    updateEvent,
    createStall,
    updateStall,
} from '@/lib/useData'
import type { Event, Stall } from '@/types/database'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

// ───────────────────────────────────────
// Event Form Modal
// ───────────────────────────────────────

const EVENT_CATEGORIES = [
    { value: 'competition', label: 'Competition' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'tech', label: 'Tech' },
    { value: 'sports', label: 'Sports' },
    { value: 'food', label: 'Food' },
]

interface EventFormProps {
    event?: Event | null
    userId: string
    onClose: () => void
    onSaved: () => void
}

function EventFormModal({ event, userId, onClose, onSaved }: EventFormProps) {
    const isEdit = !!event
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: event?.title ?? '',
        description: event?.description ?? '',
        category: event?.category ?? 'competition',
        department: event?.department ?? '',
        start_time: event?.start_time ? event.start_time.slice(0, 16) : '',
        end_time: event?.end_time ? event.end_time.slice(0, 16) : '',
        location: event?.location ?? '',
        image_url: event?.image_url ?? '',
        registration_required: event?.registration_required ?? true,
        registration_link: event?.registration_link ?? '',
        max_participants: event?.max_participants ?? '',
        is_paid: event?.is_paid ?? false,
        price: event?.price ?? '',
        tags: event?.tags?.join(', ') ?? '',
        rules: event?.rules ?? '',
    })

    const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSubmit = async () => {
        if (!form.title || !form.start_time || !form.location) {
            toast.error('Title, start time, and location are required')
            return
        }
        setSaving(true)
        const payload: any = {
            title: form.title,
            description: form.description || null,
            category: form.category,
            department: form.department || null,
            start_time: new Date(form.start_time).toISOString(),
            end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
            location: form.location,
            image_url: form.image_url || null,
            registration_required: form.registration_required,
            registration_link: form.registration_link || null,
            max_participants: form.max_participants ? Number(form.max_participants) : null,
            is_paid: form.is_paid,
            price: form.is_paid && form.price ? Number(form.price) : null,
            tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            rules: form.rules || null,
        }

        let result
        if (isEdit) {
            result = await updateEvent(event!.id, payload)
        } else {
            payload.organizer_id = userId
            payload.is_published = false
            payload.current_registrations = 0
            result = await createEvent(payload)
        }

        if (result.error) {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} event`)
            console.error(result.error)
        } else {
            toast.success(isEdit ? 'Event updated!' : 'Event created!')
            onSaved()
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
                    <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Icon icon="solar:close-circle-linear" width={22} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Title *</label>
                        <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder="Event title" />
                    </div>

                    {/* Category + Department */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Department</label>
                            <input type="text" value={form.department} onChange={e => set('department', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="e.g. CSE" />
                        </div>
                    </div>

                    {/* Timing */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Start Time *</label>
                            <input type="datetime-local" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">End Time</label>
                            <input type="datetime-local" value={form.end_time} onChange={e => set('end_time', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Location *</label>
                        <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="e.g. Main Auditorium" />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Image URL</label>
                        <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="https://..." />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3} placeholder="Describe the event..." />
                    </div>

                    {/* Registration */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input type="checkbox" checked={form.registration_required}
                            onChange={e => set('registration_required', e.target.checked)}
                            className="w-4 h-4 rounded accent-primary-600" />
                        <span className="text-sm text-gray-700 font-medium">Registration Required</span>
                    </div>

                    {form.registration_required && (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Registration Link</label>
                                <input type="url" value={form.registration_link} onChange={e => set('registration_link', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="https://forms.google.com/..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Max Participants</label>
                                    <input type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="100" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <input type="checkbox" checked={form.is_paid}
                                        onChange={e => set('is_paid', e.target.checked)}
                                        className="w-4 h-4 rounded accent-primary-600" />
                                    <span className="text-sm text-gray-700 font-medium">Paid Event</span>
                                </div>
                            </div>
                        </>
                    )}

                    {form.is_paid && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Price (₹)</label>
                            <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="299" />
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tags (comma separated)</label>
                        <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="coding, hackathon, AI" />
                    </div>

                    {/* Rules */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Rules</label>
                        <textarea value={form.rules} onChange={e => set('rules', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3} placeholder="1. Be on time&#10;2. Bring your own laptop" />
                    </div>

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={saving}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-glow press-effect disabled:opacity-60 flex items-center justify-center gap-2">
                        {saving && <Icon icon="solar:loading-bold" width={18} className="animate-spin" />}
                        {isEdit ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ───────────────────────────────────────
// Stall Form Modal
// ───────────────────────────────────────

const STALL_CATEGORIES = [
    { value: 'food', label: 'Food' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'club', label: 'Club' },
    { value: 'sponsor', label: 'Sponsor' },
]

interface StallFormProps {
    stall?: Stall | null
    userId: string
    onClose: () => void
    onSaved: () => void
}

function StallFormModal({ stall, userId, onClose, onSaved }: StallFormProps) {
    const isEdit = !!stall
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        name: stall?.name ?? '',
        description: stall?.description ?? '',
        category: stall?.category ?? 'food',
        location: stall?.location ?? '',
        images: stall?.images?.join('\n') ?? '',
        contact_phone: stall?.contact_info?.phone ?? '',
        contact_email: stall?.contact_info?.email ?? '',
        contact_whatsapp: stall?.contact_info?.whatsapp ?? '',
    })

    const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSubmit = async () => {
        if (!form.name || !form.location) {
            toast.error('Name and location are required')
            return
        }
        setSaving(true)
        const contactInfo: any = {}
        if (form.contact_phone) contactInfo.phone = form.contact_phone
        if (form.contact_email) contactInfo.email = form.contact_email
        if (form.contact_whatsapp) contactInfo.whatsapp = form.contact_whatsapp

        const payload: any = {
            name: form.name,
            description: form.description || null,
            category: form.category,
            location: form.location,
            images: form.images ? form.images.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
            contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null,
        }

        let result
        if (isEdit) {
            result = await updateStall(stall!.id, payload)
        } else {
            payload.owner_id = userId
            payload.is_active = true
            result = await createStall(payload)
        }

        if (result.error) {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} stall`)
            console.error(result.error)
        } else {
            toast.success(isEdit ? 'Stall updated!' : 'Stall created!')
            onSaved()
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
                    <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Stall' : 'Create Stall'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Icon icon="solar:close-circle-linear" width={22} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Name *</label>
                        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Stall name" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category</label>
                        <select value={form.category} onChange={e => set('category', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                            {STALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Location *</label>
                        <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="e.g. Near Main Gate, Stall #5" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3} placeholder="Describe what your stall offers..." />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Image URLs (one per line)</label>
                        <textarea value={form.images} onChange={e => set('images', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={2} placeholder="https://img1.jpg&#10;https://img2.jpg" />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Contact Info</label>
                        <div className="space-y-2">
                            <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="📞 Phone number" />
                            <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="📧 Email" />
                            <input type="tel" value={form.contact_whatsapp} onChange={e => set('contact_whatsapp', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="💬 WhatsApp number" />
                        </div>
                    </div>

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={saving}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-glow press-effect disabled:opacity-60 flex items-center justify-center gap-2">
                        {saving && <Icon icon="solar:loading-bold" width={18} className="animate-spin" />}
                        {isEdit ? 'Update Stall' : 'Create Stall'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ───────────────────────────────────────
// Registration Viewer
// ───────────────────────────────────────

function RegistrationsList({ eventId }: { eventId: string }) {
    const { registrations, loading, toggleCheckIn } = useEventRegistrations(eventId)

    if (loading) {
        return (
            <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    if (registrations.length === 0) {
        return (
            <div className="py-6 text-center">
                <Icon icon="solar:users-group-rounded-linear" width={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No registrations yet</p>
            </div>
        )
    }

    const checkedIn = registrations.filter(r => r.checked_in).length

    return (
        <div>
            <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-medium">
                    {registrations.length} registered • {checkedIn} checked in
                </span>
            </div>
            <div className="divide-y divide-gray-50">
                {registrations.map(reg => (
                    <div key={reg.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {reg.profile?.avatar_url ? (
                                <img src={reg.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                    {reg.profile?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                                {reg.profile?.name || 'Unknown'}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                                {reg.profile?.email} {reg.profile?.college_id && `• ${reg.profile.college_id}`}
                            </div>
                        </div>
                        <button
                            onClick={() => toggleCheckIn(reg.id, reg.checked_in)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${reg.checked_in
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                        >
                            <Icon
                                icon={reg.checked_in ? 'solar:check-circle-bold' : 'solar:login-3-linear'}
                                width={14}
                            />
                            {reg.checked_in ? 'In' : 'Check In'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ───────────────────────────────────────
// Main Organiser Tools Page
// ───────────────────────────────────────

export default function OrganiserTools() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()

    const isEventManager = profile?.roles?.some(r => ['event_manager', 'app_admin', 'super_admin'].includes(r))
    const isStallManager = profile?.roles?.some(r => ['stall_manager', 'app_admin', 'super_admin'].includes(r))

    const { events, loading: eventsLoading, refresh: refreshEvents, setEvents } = useMyEvents(user?.uid)
    const { stalls, loading: stallsLoading, refresh: refreshStalls, setStalls } = useMyStalls(user?.uid)

    // UI State
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
    const [formEvent, setFormEvent] = useState<Event | null | undefined>(undefined) // undefined = closed, null = new, Event = edit
    const [formStall, setFormStall] = useState<Stall | null | undefined>(undefined) // undefined = closed, null = new, Stall = edit
    const [activeTab, setActiveTab] = useState<'events' | 'stalls'>('events')

    // Guard
    if (!profile?.roles?.some(r => ['event_manager', 'stall_manager', 'team_member', 'app_admin', 'super_admin'].includes(r))) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Icon icon="solar:lock-keyhole-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                    <h2 className="font-bold text-gray-900 mb-1">Unauthorized</h2>
                    <p className="text-sm text-gray-500 mb-4">You need an organiser role to access this page.</p>
                    <Link to="/profile" className="text-primary-600 font-semibold text-sm">← Back to Profile</Link>
                </div>
            </div>
        )
    }

    const totalRegistrations = events.reduce((sum, e) => sum + (e.current_registrations || 0), 0)

    // Toggle handlers
    const handleTogglePublish = async (event: Event) => {
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e))
        const { error } = await toggleEventPublish(event.id, event.is_published)
        if (error) {
            setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: event.is_published } : e))
            toast.error('Failed to update')
        } else {
            toast.success(event.is_published ? 'Unpublished' : 'Published!')
        }
    }

    const handleToggleStall = async (stall: Stall) => {
        setStalls(prev => prev.map(s => s.id === stall.id ? { ...s, is_active: !s.is_active } : s))
        const { error } = await toggleStallActive(stall.id, stall.is_active)
        if (error) {
            setStalls(prev => prev.map(s => s.id === stall.id ? { ...s, is_active: stall.is_active } : s))
            toast.error('Failed to update')
        } else {
            toast.success(stall.is_active ? 'Stall deactivated' : 'Stall activated!')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <Icon icon="solar:arrow-left-linear" width={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Organiser Tools</h1>
                        <p className="text-[10px] text-white/80">Manage your events & stalls</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{events.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Events</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{stalls.length}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Stalls</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{totalRegistrations}</div>
                        <div className="text-[10px] text-white/70 font-medium uppercase">Registrations</div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'events'
                            ? 'text-orange-600 border-orange-500'
                            : 'text-gray-400 border-transparent'
                        }`}
                >
                    <Icon icon="solar:calendar-bold" width={16} className="inline mr-1.5 -mt-0.5" />
                    My Events
                </button>
                <button
                    onClick={() => setActiveTab('stalls')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'stalls'
                            ? 'text-orange-600 border-orange-500'
                            : 'text-gray-400 border-transparent'
                        }`}
                >
                    <Icon icon="solar:shop-2-bold" width={16} className="inline mr-1.5 -mt-0.5" />
                    My Stalls
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {activeTab === 'events' && (
                    <>
                        {/* Create Event Button */}
                        {isEventManager && (
                            <button
                                onClick={() => setFormEvent(null)}
                                className="w-full p-3 bg-white rounded-xl border-2 border-dashed border-orange-200 text-orange-600 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-orange-50 transition-colors active:scale-[0.99]"
                            >
                                <Icon icon="solar:add-circle-linear" width={20} />
                                Create New Event
                            </button>
                        )}

                        {eventsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:calendar-search-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No events yet</p>
                                <p className="text-xs text-gray-400 mt-1">Create your first event above</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Event Card */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{event.title}</h4>
                                                    <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${event.is_published
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {event.is_published ? 'Live' : 'Draft'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="solar:calendar-linear" width={12} />
                                                        {format(new Date(event.start_time), 'MMM d, h:mm a')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="solar:map-point-linear" width={12} />
                                                        {event.location}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="solar:users-group-rounded-linear" width={12} />
                                                        {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''} registered
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium">
                                                        {event.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                            <button
                                                onClick={() => setFormEvent(event)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                <Icon icon="solar:pen-linear" width={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleTogglePublish(event)}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${event.is_published
                                                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                            >
                                                <Icon icon={event.is_published ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={14} />
                                                {event.is_published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors ml-auto"
                                            >
                                                <Icon icon="solar:users-group-rounded-linear" width={14} />
                                                {expandedEvent === event.id ? 'Hide' : 'Registrations'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Registrations */}
                                    {expandedEvent === event.id && (
                                        <div className="border-t border-gray-100 bg-gray-50/50">
                                            <RegistrationsList eventId={event.id} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'stalls' && (
                    <>
                        {/* Create Stall Button */}
                        {isStallManager && (
                            <button
                                onClick={() => setFormStall(null)}
                                className="w-full p-3 bg-white rounded-xl border-2 border-dashed border-orange-200 text-orange-600 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-orange-50 transition-colors active:scale-[0.99]"
                            >
                                <Icon icon="solar:add-circle-linear" width={20} />
                                Create New Stall
                            </button>
                        )}

                        {stallsLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : stalls.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="solar:shop-2-linear" width={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No stalls yet</p>
                                <p className="text-xs text-gray-400 mt-1">Create your first stall above</p>
                            </div>
                        ) : (
                            stalls.map(stall => (
                                <div key={stall.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {stall.images?.[0] && (
                                                <img src={stall.images[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{stall.name}</h4>
                                                    <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stall.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {stall.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{stall.location}</div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                                                        {stall.category}
                                                    </span>
                                                    {stall.menu_items && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {Array.isArray(stall.menu_items) ? stall.menu_items.length : 0} items
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Stall Quick Actions */}
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={() => setFormStall(stall)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            <Icon icon="solar:pen-linear" width={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStall(stall)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stall.is_active
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            <Icon icon={stall.is_active ? 'solar:power-bold' : 'solar:power-linear'} width={14} />
                                            {stall.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>

            {/* Event Form Modal */}
            {formEvent !== undefined && (
                <EventFormModal
                    event={formEvent}
                    userId={user!.uid}
                    onClose={() => setFormEvent(undefined)}
                    onSaved={() => { setFormEvent(undefined); refreshEvents() }}
                />
            )}

            {/* Stall Form Modal */}
            {formStall !== undefined && (
                <StallFormModal
                    stall={formStall}
                    userId={user!.uid}
                    onClose={() => setFormStall(undefined)}
                    onSaved={() => { setFormStall(undefined); refreshStalls() }}
                />
            )}
        </div>
    )
}
