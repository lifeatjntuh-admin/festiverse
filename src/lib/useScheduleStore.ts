
import { create } from 'zustand'

type Days = 'day1' | 'day2'

interface ScheduleState {
    activeDay: Days
    setActiveDay: (day: Days) => void
}

export const useScheduleStore = create<ScheduleState>((set) => ({
    activeDay: 'day1',
    setActiveDay: (day) => set({ activeDay: day }),
}))
