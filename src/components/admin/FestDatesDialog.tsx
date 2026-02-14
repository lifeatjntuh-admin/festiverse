import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { useFestDates, updateFestDates } from '@/lib/useData'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { FestDates } from '@/types/database'

interface FestDatesDialogProps {
    isOpen: boolean
    onClose: () => void
}

export default function FestDatesDialog({ isOpen, onClose }: FestDatesDialogProps) {
    const { t } = useTranslation()
    const { dates, loading, refresh } = useFestDates()
    const [form, setForm] = useState<FestDates | null>(null)
    const [saving, setSaving] = useState(false)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        if (dates) {
            setForm(dates)
        }
    }, [dates])

    if (!isOpen) return null

    const handleChange = (day: 'day1' | 'day2', field: 'start' | 'end', value: string) => {
        if (!form) return

        const date = new Date(value)
        if (isNaN(date.getTime())) return // Prevent invalid date crash

        setForm(prev => ({
            ...prev!,
            [day]: {
                ...prev![day],
                [field]: date.toISOString()
            }
        }))
    }

    const handleSave = async () => {
        if (!form) return
        setSaving(true)
        const { error } = await updateFestDates(form)
        if (error) {
            toast.error(t('admin.updateFailed'))
            console.error(error)
        } else {
            toast.success(t('admin.datesUpdated'))
            refresh()
            onClose()
        }
        setSaving(false)
        setConfirming(false)
    }

    const toLocal = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm")

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                        <Icon icon="solar:calendar-date-bold" className="text-primary-600 dark:text-primary-400" />
                        {t('admin.festDates')}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <Icon icon="solar:close-circle-linear" width={24} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {loading || !form ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-muted rounded animate-pulse" />
                            <div className="h-10 bg-muted rounded animate-pulse" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">{t('admin.day1')}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block text-foreground">{t('admin.startTime')}</label>
                                        <input type="datetime-local"
                                            value={toLocal(form.day1.start)}
                                            onChange={e => handleChange('day1', 'start', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:focus:bg-zinc-800 dark:text-white scheme-light dark:scheme-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block text-foreground">{t('admin.endTime')}</label>
                                        <input type="datetime-local"
                                            value={toLocal(form.day1.end)}
                                            onChange={e => handleChange('day1', 'end', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:focus:bg-zinc-800 dark:text-white scheme-light dark:scheme-dark"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">{t('admin.day2')}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block text-foreground">{t('admin.startTime')}</label>
                                        <input type="datetime-local"
                                            value={toLocal(form.day2.start)}
                                            onChange={e => handleChange('day2', 'start', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:focus:bg-zinc-800 dark:text-white scheme-light dark:scheme-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block text-foreground">{t('admin.endTime')}</label>
                                        <input type="datetime-local"
                                            value={toLocal(form.day2.end)}
                                            onChange={e => handleChange('day2', 'end', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:focus:bg-zinc-800 dark:text-white scheme-light dark:scheme-dark"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                    {confirming ? (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <span className="text-xs font-medium text-muted-foreground">{t('common.areYouSure')}</span>
                            <button onClick={() => setConfirming(false)} className="px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">{t('common.cancel')}</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2">
                                {saving ? <Icon icon="solar:loading-bold" className="animate-spin" /> : <Icon icon="solar:check-circle-bold" />}
                                {t('common.confirm')}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setConfirming(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform active:scale-95 flex items-center gap-2">
                            <Icon icon="solar:disk-bold" />
                            {t('common.saveChanges')}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
