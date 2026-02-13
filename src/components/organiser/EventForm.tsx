import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/lib/useAuthStore'
import {
    createEvent,
    updateEvent,
} from '@/lib/useData'
import { uploadImage, getOptimizedImageUrl } from '@/lib/cloudinary'
import type { Event } from '@/types/database'
import toast from 'react-hot-toast'
import { useFormStore } from '@/lib/useFormStore'

// ─── Helpers ──────────────────────────
const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase mb-1 block'

function lsGet<T>(key: string, fallback: T): T {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key: string, value: any) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}
function lsRemove(key: string) {
    try { localStorage.removeItem(key) } catch { /* */ }
}

const EVENT_CATEGORIES = [
    { value: 'competition', label: 'Competition' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'tech', label: 'Tech' },
    { value: 'sports', label: 'Sports' },
    { value: 'food', label: 'Food' },
]

interface EventFormProps {
    formId: string
    event?: Event | null
    onSaved?: () => void
    minimized: boolean
    pillIndex: number
}

export default function EventForm({ formId, event, onSaved, minimized, pillIndex }: EventFormProps) {
    const { user } = useAuthStore()
    const { closeForm, toggleMinimize } = useFormStore()

    // We need userId for creation, if not logged in we shouldn't be here, but let's handle safely
    const userId = user?.uid

    const isEdit = !!event
    const lsKey = `festiverse_event_form_${formId}`
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showUrlInput, setShowUrlInput] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const makeDefault = useCallback(() => ({
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
    }), [event])

    const [form, setForm] = useState(() => lsGet(lsKey, makeDefault()))

    // Persist to localStorage on every change
    useEffect(() => { lsSet(lsKey, form) }, [form, lsKey])

    const set = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }))

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const url = await uploadImage(file)
            set('image_url', url)
            toast.success('Image uploaded!')
        } catch { toast.error('Image upload failed') }
        setUploading(false)
    }

    const handleSubmit = async () => {
        if (!userId) { toast.error('You must be logged in'); return }
        if (!form.title || !form.start_time || !form.location) {
            toast.error('Title, start time, and location are required'); return
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
            payload.organizer_id = userId; payload.is_published = false; payload.current_registrations = 0
            result = await createEvent(payload)
        }
        if (result.error) {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} event`); console.error(result.error)
        } else {
            toast.success(isEdit ? 'Event updated!' : 'Event created!')
            lsRemove(lsKey)
            onSaved?.()
            closeForm(formId)
        }
        setSaving(false)
    }

    const handleClose = () => { lsRemove(lsKey); closeForm(formId) }
    const onToggleMinimize = () => toggleMinimize(formId)

    // ── Minimized pill ──
    if (minimized) {
        return createPortal(
            <div className="fixed left-0 right-0 z-[100] px-3 max-w-3xl mx-auto pointer-events-none" style={{ bottom: `${76 + pillIndex * 64}px` }}>
                <button
                    onClick={onToggleMinimize}
                    className="w-full pointer-events-auto bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:calendar-add-bold" width={18} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-bold truncate">{form.title || (isEdit ? 'Editing Event' : 'New Event')}</div>
                        <div className="text-[10px] text-white/70">Tap to continue editing</div>
                    </div>
                    <Icon icon="solar:maximize-square-linear" width={20} className="text-white/80 flex-shrink-0" />
                </button>
            </div>,
            document.body
        )
    }

    // ── Full-screen form ──
    return createPortal(
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
            {/* Fixed Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <Icon icon="solar:close-circle-linear" width={22} className="text-gray-400" />
                    </button>
                    <h2 className="font-bold text-gray-900 text-base">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
                </div>
                <button onClick={onToggleMinimize} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Minimize — your progress is saved">
                    <Icon icon="solar:minimize-square-linear" width={20} className="text-gray-500" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
                {/* Title */}
                <div>
                    <label className={LABEL}>Title *</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={INPUT} placeholder="Event title" />
                </div>
                {/* Category + Dept */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL}>Category</label>
                        <select value={form.category} onChange={e => set('category', e.target.value)} className={`${INPUT} bg-white`}>
                            {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={LABEL}>Department</label>
                        <input type="text" value={form.department} onChange={e => set('department', e.target.value)} className={INPUT} placeholder="e.g. CSE" />
                    </div>
                </div>
                {/* Timing */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL}>Start *</label>
                        <input type="datetime-local" value={form.start_time} onChange={e => set('start_time', e.target.value)} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>End</label>
                        <input type="datetime-local" value={form.end_time} onChange={e => set('end_time', e.target.value)} className={INPUT} />
                    </div>
                </div>
                {/* Location */}
                <div>
                    <label className={LABEL}>Location *</label>
                    <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className={INPUT} placeholder="e.g. Main Auditorium" />
                </div>
                {/* Cover Image */}
                <div>
                    <label className={LABEL}>Cover Image</label>
                    {form.image_url && (
                        <div className="relative mb-2 rounded-xl overflow-hidden border border-gray-200">
                            <img src={getOptimizedImageUrl(form.image_url, 400)} alt="" className="w-full h-36 object-cover" />
                            <button onClick={() => set('image_url', '')} className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">×</button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="flex-1 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {uploading
                                ? <><Icon icon="solar:loading-bold" width={16} className="animate-spin" /> Uploading...</>
                                : <><Icon icon="solar:camera-add-linear" width={16} /> Upload Image</>}
                        </button>
                        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                            <Icon icon="solar:link-linear" width={16} />
                        </button>
                    </div>
                    {showUrlInput && (
                        <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)}
                            className={`${INPUT} mt-2`} placeholder="Or paste image URL..." />
                    )}
                </div>
                {/* Description */}
                <div>
                    <label className={LABEL}>Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        className={`${INPUT} resize-none`} rows={3} placeholder="Describe the event..." />
                </div>
                {/* Registration */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input type="checkbox" checked={form.registration_required}
                        onChange={e => set('registration_required', e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
                    <span className="text-sm text-gray-700 font-medium">Registration Required</span>
                </div>
                {form.registration_required && (
                    <>
                        <div>
                            <label className={LABEL}>Registration Link</label>
                            <input type="url" value={form.registration_link} onChange={e => set('registration_link', e.target.value)}
                                className={INPUT} placeholder="https://forms.google.com/..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL}>Max Participants</label>
                                <input type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} className={INPUT} placeholder="100" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input type="checkbox" checked={form.is_paid} onChange={e => set('is_paid', e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
                                <span className="text-sm text-gray-700 font-medium">Paid</span>
                            </div>
                        </div>
                    </>
                )}
                {form.is_paid && (
                    <div>
                        <label className={LABEL}>Price (₹)</label>
                        <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={INPUT} placeholder="299" />
                    </div>
                )}
                {/* Tags */}
                <div>
                    <label className={LABEL}>Tags (comma separated)</label>
                    <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} className={INPUT} placeholder="coding, hackathon, AI" />
                </div>
                {/* Rules */}
                <div>
                    <label className={LABEL}>Rules</label>
                    <textarea value={form.rules} onChange={e => set('rules', e.target.value)}
                        className={`${INPUT} resize-none`} rows={3} placeholder={"1. Be on time\n2. Bring your laptop"} />
                </div>
            </div>

            {/* Fixed Submit Bar */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <button onClick={handleSubmit} disabled={saving}
                    className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-glow press-effect disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <Icon icon="solar:loading-bold" width={18} className="animate-spin" />}
                    {isEdit ? 'Update Event' : 'Create Event'}
                </button>
            </div>
        </div>,
        document.body
    )
}
