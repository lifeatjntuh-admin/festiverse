import { create } from 'zustand'
import { Event, Stall } from '@/types/database'

export interface OpenFormState {
    id: string
    type: 'event' | 'stall'
    entity: Event | Stall | null
    minimized: boolean
    // Callback to refresh data in the parent component if needed
    // Note: Since we are using a global store, components might just rely on re-fetching or real-time subscriptions
    onSaved?: () => void
}

interface FormStore {
    forms: OpenFormState[]

    // Actions
    openForm: (type: 'event' | 'stall', entity?: Event | Stall | null, onSaved?: () => void) => void
    closeForm: (id: string) => void
    toggleMinimize: (id: string) => void
    minimizeAll: () => void
    maximize: (id: string) => void
}

export const useFormStore = create<FormStore>((set) => ({
    forms: [],

    openForm: (type, entity = null, onSaved) => {
        set((state) => {
            // Check if already open (optional, maybe we want multiple?)
            // For now let's allow multiple, but usually you only edit one thing at a time.
            // Let's generate a unique ID
            const id = crypto.randomUUID()
            return {
                forms: [...state.forms, { id, type, entity, minimized: false, onSaved }]
            }
        })
    },

    closeForm: (id) => {
        set((state) => ({
            forms: state.forms.filter((f) => f.id !== id)
        }))
    },

    toggleMinimize: (id) => {
        set((state) => ({
            forms: state.forms.map((f) =>
                f.id === id ? { ...f, minimized: !f.minimized } : f
            )
        }))
    },

    minimizeAll: () => {
        set((state) => ({
            forms: state.forms.map((f) => ({ ...f, minimized: true }))
        }))
    },

    maximize: (id) => {
        set((state) => ({
            forms: state.forms.map((f) =>
                f.id === id ? { ...f, minimized: false } : f
            )
        }))
    }
}))
