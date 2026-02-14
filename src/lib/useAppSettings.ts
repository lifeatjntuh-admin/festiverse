import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { DEFAULT_FEST_DATES } from './useData'
import type { FestDates } from '@/types/database'

export interface AppSettings {
    appName: string
    festDates: FestDates
}

export function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings>({
        appName: 'Festiverse',
        festDates: DEFAULT_FEST_DATES
    })
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('app_settings')
            .select('key, value')
            .in('key', ['app_name', 'fest_dates'])

        if (error) {
            console.error('Failed to fetch app settings:', error)
        } else {
            const newSettings = { ...settings }
            data?.forEach(item => {
                if (item.key === 'app_name') newSettings.appName = item.value
                if (item.key === 'fest_dates') newSettings.festDates = item.value
            })
            setSettings(newSettings)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { ...settings, loading, refresh }
}

export async function updateAppName(newName: string): Promise<{ error: any }> {
    const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid
    if (!executorId) return { error: { message: 'Not authenticated' } }

    const { error } = await supabase.rpc('update_app_setting', {
        executor_id: executorId,
        setting_key: 'app_name',
        setting_value: newName
    })

    return { error }
}

export async function updateFestDates(dates: FestDates): Promise<{ error: any }> {
    // Re-using the RPC method for dates as it might have specific logic or strict RLS
    // But if we want to use direct upsert we can try, but let's stick to the pattern if it exists.
    // However, the RPC was 'update_fest_dates'.
    // Let's try direct upsert first as it's cleaner if RLS allows.
    // If previous conversation said RLS was fixed for app_settings, upsert should work.

    const executorId = (await import('@/lib/useAuthStore')).useAuthStore.getState().user?.uid
    if (!executorId) return { error: { message: 'Not authenticated' } }

    return supabase.rpc('update_fest_dates', {
        executor_id: executorId,
        new_dates: dates
    })
}
