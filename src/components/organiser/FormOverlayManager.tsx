import { useFormStore } from '@/lib/useFormStore'
import EventForm from '@/components/organiser/EventForm'
import StallForm from '@/components/organiser/StallForm'
import TeamManagerPanel from '@/components/organiser/TeamManagerPanel'

export default function FormOverlayManager() {
    const { forms } = useFormStore()

    if (forms.length === 0) return null

    // Calculate pill index for minimized forms
    // We only care about the order of minimized forms for stacking
    const minimizedForms = forms.filter(f => f.minimized)

    return (
        <>
            {forms.map((form) => {
                const pillIndex = minimizedForms.findIndex(f => f.id === form.id)

                if (form.type === 'event') {
                    return (
                        <EventForm
                            key={form.id}
                            formId={form.id}
                            event={form.entity as any} // Cast safely as we know type matches
                            onSaved={form.onSaved}
                            minimized={form.minimized}
                            pillIndex={pillIndex}
                        />
                    )
                }

                if (form.type === 'stall') {
                    return (
                        <StallForm
                            key={form.id}
                            formId={form.id}
                            stall={form.entity as any}
                            onSaved={form.onSaved}
                            minimized={form.minimized}
                            pillIndex={pillIndex}
                        />
                    )
                }

                if (form.type === 'team') {
                    return (
                        <TeamManagerPanel
                            key={form.id}
                            formId={form.id}
                            event={form.entity as any}
                            minimized={form.minimized}
                            pillIndex={pillIndex}
                        />
                    )
                }

                return null
            })}
        </>
    )
}
