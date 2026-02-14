import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { useAppSettings, updateAppName, updateFestDates } from '@/lib/useAppSettings'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { FestDates } from '@/types/database'

interface AppSettingsDialogProps {
    isOpen: boolean
    onClose: () => void
}

export default function AppSettingsDialog({ isOpen, onClose }: AppSettingsDialogProps) {
    const { t } = useTranslation()
    const { appName, festDates, loading, refresh } = useAppSettings()

    // Form States
    const [formDates, setFormDates] = useState<FestDates | null>(null)
    const [formAppName, setFormAppName] = useState('')

    // UI States
    const [saving, setSaving] = useState(false)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        if (festDates) setFormDates(festDates)
        if (appName) setFormAppName(appName)
    }, [festDates, appName])

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return null

    const handleDateChange = (day: 'day1' | 'day2', field: 'start' | 'end', value: string) => {
        if (!formDates) return
        const date = new Date(value)
        if (isNaN(date.getTime())) return

        setFormDates(prev => ({
            ...prev!,
            [day]: { ...prev![day], [field]: date.toISOString() }
        }))
    }

    const handleSave = async () => {
        if (!formDates) return
        setSaving(true)

        const promises = []
        if (formAppName !== appName) {
            promises.push(updateAppName(formAppName))
        }
        if (JSON.stringify(formDates) !== JSON.stringify(festDates)) {
            promises.push(updateFestDates(formDates))
        }

        if (promises.length === 0) {
            setSaving(false)
            setConfirming(false)
            onClose()
            return
        }

        const results = await Promise.all(promises)
        const errors = results.filter(r => r.error)

        if (errors.length > 0) {
            toast.error(t('admin.updateFailed'))
            console.error(errors)
        } else {
            toast.success("Settings updated successfully")
            refresh()
            onClose()
        }
        setSaving(false)
        setConfirming(false)
    }

    const toLocal = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm")

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-black/95 flex flex-col overflow-hidden animate-fade-in">

            {/* Top Bar / Header */}
            <div className="sticky top-0 z-10 glass dark:bg-zinc-900/90 border-b border-gray-200 dark:border-zinc-800 px-4 h-16 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                    >
                        <Icon icon="solar:arrow-left-linear" width={24} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-tight">
                            {t('admin.appSettings') || "App Settings"}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-2xl mx-auto space-y-6">

                    {loading || !formDates ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
                            <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
                        </div>
                    ) : (
                        <>
                            {/* App Identity Section */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                                    Identity
                                </h3>
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-4 space-y-3">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Icon icon="solar:smartphone-linear" className="text-primary-600 dark:text-primary-400" />
                                            Application Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formAppName}
                                                onChange={e => setFormAppName(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border-none ring-1 ring-gray-200 dark:ring-zinc-700 bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-gray-400"
                                                placeholder="Enter App Name"
                                            />
                                            <Icon icon="solar:pen-bold" className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" width={18} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                                            Shows up in the header and browser tab.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Fest Dates Section */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                                    Event Schedule
                                </h3>
                                <div className="space-y-4">
                                    {/* Day 1 Card */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-orange-50/50 dark:bg-orange-950/10 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <Icon icon="solar:calendar-bold" width={18} />
                                            </div>
                                            <span className="font-bold text-orange-700 dark:text-orange-400 text-sm tracking-wide uppercase">
                                                {t('admin.day1')}
                                            </span>
                                        </div>
                                        <div className="p-4 grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Starts</label>
                                                <input type="datetime-local"
                                                    value={toLocal(formDates.day1.start)}
                                                    onChange={e => handleDateChange('day1', 'start', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border-none ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-black/50 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all scheme-light dark:scheme-dark"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ends</label>
                                                <input type="datetime-local"
                                                    value={toLocal(formDates.day1.end)}
                                                    onChange={e => handleDateChange('day1', 'end', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border-none ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-black/50 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all scheme-light dark:scheme-dark"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day 2 Card */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-950/10 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <Icon icon="solar:calendar-bold" width={18} />
                                            </div>
                                            <span className="font-bold text-blue-700 dark:text-blue-400 text-sm tracking-wide uppercase">
                                                {t('admin.day2')}
                                            </span>
                                        </div>
                                        <div className="p-4 grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Starts</label>
                                                <input type="datetime-local"
                                                    value={toLocal(formDates.day2.start)}
                                                    onChange={e => handleDateChange('day2', 'start', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border-none ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-black/50 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all scheme-light dark:scheme-dark"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ends</label>
                                                <input type="datetime-local"
                                                    value={toLocal(formDates.day2.end)}
                                                    onChange={e => handleDateChange('day2', 'end', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border-none ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-black/50 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all scheme-light dark:scheme-dark"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20 pointer-events-none">
                <div className="pointer-events-auto shadow-2xl shadow-primary-500/20 rounded-2xl overflow-hidden">
                    {confirming ? (
                        <div className="bg-red-600 text-white p-2 pl-4 flex items-center gap-3 animate-fade-in">
                            <span className="text-sm font-semibold whitespace-nowrap">{t('common.areYouSure') || "Update Settings?"}</span>
                            <div className="flex bg-red-700 rounded-xl p-1">
                                <button
                                    onClick={() => setConfirming(false)}
                                    className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                                    title="Cancel"
                                >
                                    <Icon icon="solar:close-circle-bold" width={20} />
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Icon icon="solar:loading-bold" className="animate-spin" width={20} />
                                    ) : (
                                        <>
                                            <Icon icon="solar:check-circle-bold" width={20} />
                                            <span>{t('common.confirm')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirming(true)}
                            className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-8 py-4 text-base font-bold flex items-center gap-3 transition-all active:scale-95"
                        >
                            <Icon icon="solar:disk-bold" width={24} />
                            {t('common.saveChanges')}
                        </button>
                    )}
                </div>
            </div>

        </div>,
        document.body
    )
}
