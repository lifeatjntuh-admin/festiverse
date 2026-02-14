import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/useAuthStore'
import {
    createStall,
    updateStall,
} from '@/lib/useData'
import { uploadImage, getOptimizedImageUrl } from '@/lib/cloudinary'
import type { Stall } from '@/types/database'
import toast from 'react-hot-toast'
import { useFormStore } from '@/lib/useFormStore'

// ─── Helpers ──────────────────────────
const INPUT = 'w-full px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm bg-white dark:bg-background text-foreground focus:ring-2 focus:ring-primary-500 outline-none transition-all'
const LABEL = 'text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase mb-1 block'

function lsGet<T>(key: string, fallback: T): T {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key: string, value: any) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}
function lsRemove(key: string) {
    try { localStorage.removeItem(key) } catch { /* */ }
}

const STALL_CATEGORIES = [
    { value: 'food', labelKey: 'categories.food' },
    { value: 'merchandise', labelKey: 'stalls.merch' },
    { value: 'club', labelKey: 'stalls.club' },
    { value: 'sponsor', labelKey: 'stalls.sponsor' },
]

interface StallFormProps {
    formId: string
    stall?: Stall | null
    onSaved?: () => void
    minimized: boolean
    pillIndex: number
}

export default function StallForm({ formId, stall, onSaved, minimized, pillIndex }: StallFormProps) {
    const { user } = useAuthStore()
    const { closeForm, toggleMinimize } = useFormStore()
    const { t } = useTranslation()

    // We need userId for creation
    const userId = user?.uid

    const isEdit = !!stall
    const lsKey = `festiverse_stall_form_${formId}`
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showUrlInput, setShowUrlInput] = useState(false)
    const stallFileRef = useRef<HTMLInputElement>(null)

    const makeDefault = useCallback(() => ({
        name: stall?.name ?? '',
        description: stall?.description ?? '',
        category: stall?.category ?? 'food',
        location: stall?.location ?? '',
        imageUrls: stall?.images ?? [] as string[],
        contact_phone: stall?.contact_info?.phone ?? '',
        contact_email: stall?.contact_info?.email ?? '',
        contact_whatsapp: stall?.contact_info?.whatsapp ?? '',
    }), [stall])

    const [form, setForm] = useState(() => lsGet(lsKey, makeDefault()))

    useEffect(() => { lsSet(lsKey, form) }, [form, lsKey])

    const set = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }))

    const handleStallImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const url = await uploadImage(file)
            set('imageUrls', [...form.imageUrls, url])
            toast.success(t('stallForm.imageUploaded'))
        } catch { toast.error(t('stallForm.imageUploadFailed')) }
        setUploading(false)
    }

    const removeStallImage = (index: number) => {
        set('imageUrls', form.imageUrls.filter((_: string, i: number) => i !== index))
    }

    const handleSubmit = async () => {
        if (!userId) { toast.error(t('stallForm.mustBeLoggedIn')); return }
        if (!form.name || !form.location) {
            toast.error(t('stallForm.nameLocationRequired')); return
        }
        setSaving(true)
        const contactInfo: any = {}
        if (form.contact_phone) contactInfo.phone = form.contact_phone
        if (form.contact_email) contactInfo.email = form.contact_email
        if (form.contact_whatsapp) contactInfo.whatsapp = form.contact_whatsapp
        const payload: any = {
            name: form.name, description: form.description || null,
            category: form.category, location: form.location,
            images: form.imageUrls.filter(Boolean),
            contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null,
        }
        let result
        if (isEdit) {
            result = await updateStall(stall!.id, payload)
        } else {
            payload.owner_id = userId; payload.is_active = true
            result = await createStall(payload)
        }
        if (result.error) {
            toast.error(t('stallForm.failedToSave', { action: isEdit ? 'update' : 'create' })); console.error(result.error)
        } else {
            toast.success(isEdit ? t('stallForm.stallUpdated') : t('stallForm.stallCreated'))
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
                    className="w-full pointer-events-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:shop-2-bold" width={18} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-bold truncate">{form.name || (isEdit ? t('stallForm.editing') : t('stallForm.new'))}</div>
                        <div className="text-[10px] text-white/70">{t('stallForm.tapToContinueEditing')}</div>
                    </div>
                    <Icon icon="solar:maximize-square-linear" width={20} className="text-white/80 flex-shrink-0" />
                </button>
            </div>,
            document.body
        )
    }

    // ── Full-screen form ──
    return createPortal(
        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-background flex flex-col" style={{ height: '100dvh' }}>
            {/* Fixed Header */}
            <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors">
                        <Icon icon="solar:close-circle-linear" width={22} className="text-gray-400 dark:text-muted-foreground" />
                    </button>
                    <h2 className="font-bold text-gray-900 dark:text-foreground text-base">{isEdit ? t('stallForm.updateStall') : t('stallForm.createStall')}</h2>
                </div>
                <button onClick={onToggleMinimize} className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors" title={t('organiser.minimize')}>
                    <Icon icon="solar:minimize-square-linear" width={20} className="text-gray-500 dark:text-muted-foreground" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
                {/* Name */}
                <div>
                    <label className={LABEL}>{t('stallForm.nameLabel')} *</label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={INPUT} placeholder={t('stallForm.namePlaceholder')} />
                </div>
                {/* Category */}
                <div>
                    <label className={LABEL}>{t('stallForm.categoryLabel')}</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} className={`${INPUT} bg-white dark:bg-background`}>
                        {STALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
                    </select>
                </div>
                {/* Location */}
                <div>
                    <label className={LABEL}>{t('stallForm.locationLabel')} *</label>
                    <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className={INPUT} placeholder={t('stallForm.locationPlaceholder')} />
                </div>
                {/* Description */}
                <div>
                    <label className={LABEL}>{t('stallForm.descriptionLabel')}</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        className={`${INPUT} resize-none`} rows={3} placeholder={t('stallForm.descriptionPlaceholder')} />
                </div>
                {/* Images */}
                <div>
                    <label className={LABEL}>{t('stallForm.imagesLabel')}</label>
                    {form.imageUrls.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                            {form.imageUrls.map((url: string, i: number) => (
                                <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-border">
                                    <img src={getOptimizedImageUrl(url, 200)} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => removeStallImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-black/80">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input type="file" ref={stallFileRef} accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleStallImageUpload(e.target.files[0])} />
                        <button type="button" onClick={() => stallFileRef.current?.click()} disabled={uploading}
                            className="flex-1 py-2.5 border-2 border-dashed border-gray-200 dark:border-border rounded-xl text-sm text-gray-500 dark:text-muted-foreground font-medium hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {uploading
                            ? <><Icon icon="solar:loading-bold" width={16} className="animate-spin" /> {t('stallForm.uploading')}</>
                            : <><Icon icon="solar:camera-add-linear" width={16} /> {t('stallForm.addImage')}</>}
                        </button>
                        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)}
                            className="px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                            <Icon icon="solar:link-linear" width={16} />
                        </button>
                    </div>
                    {showUrlInput && (
                        <div className="flex gap-2 mt-2">
                            <input type="url" id={`stall-url-${formId}`} className={`flex-1 ${INPUT}`} placeholder={t('stallForm.pasteImageUrlPlaceholder')} />
                                <button type="button" onClick={() => {
                                const input = document.getElementById(`stall-url-${formId}`) as HTMLInputElement
                                if (input?.value) { set('imageUrls', [...form.imageUrls, input.value]); input.value = '' }
                                }} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-semibold">{t('stallForm.add')}</button>
                        </div>
                    )}
                </div>
                {/* Contact Info */}
                <div>
                        <label className={`${LABEL} mb-1.5`}>{t('stallForm.contactInfoLabel')}</label>
                    <div className="space-y-2">
                            <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className={INPUT} placeholder={t('stallForm.contactPhonePlaceholder')} />
                            <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className={INPUT} placeholder={t('stallForm.contactEmailPlaceholder')} />
                            <input type="tel" value={form.contact_whatsapp} onChange={e => set('contact_whatsapp', e.target.value)} className={INPUT} placeholder={t('stallForm.contactWhatsAppPlaceholder')} />
                    </div>
                </div>
            </div>

            {/* Fixed Submit Bar */}
            <div className="flex-shrink-0 bg-white dark:bg-card border-t border-gray-200 dark:border-border p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <button onClick={handleSubmit} disabled={saving}
                    className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-glow press-effect disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <Icon icon="solar:loading-bold" width={18} className="animate-spin" />}
                    {isEdit ? t('stallForm.updateStall') : t('stallForm.createStall')}
                </button>
            </div>
        </div>,
        document.body
    )
}
