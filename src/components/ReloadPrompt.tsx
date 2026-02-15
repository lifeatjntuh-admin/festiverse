import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl) {
            console.log(`Service Worker at: ${swUrl}`)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    useEffect(() => {
        if (offlineReady) {
            toast.success('App ready to work offline', {
                duration: 4000,
                id: 'offline-ready',
            })
            setOfflineReady(false)
        }
    }, [offlineReady, setOfflineReady])

    useEffect(() => {
        if (needRefresh) {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <span className="font-medium">New content available, click on reload button to update.</span>
                    <div className="flex gap-2 mt-1">
                        <button
                            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:bg-primary/90 transition-colors"
                            onClick={() => {
                                updateServiceWorker(true)
                                toast.dismiss(t.id)
                            }}
                        >
                            Reload
                        </button>
                        <button
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-md font-medium hover:bg-secondary/80 transition-colors"
                            onClick={() => {
                                setOfflineReady(false)
                                setNeedRefresh(false)
                                toast.dismiss(t.id)
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
                position: 'bottom-right',
                id: 'pwa-reload-prompt',
            })
        }
    }, [needRefresh, updateServiceWorker, setNeedRefresh, setOfflineReady])

    return null
}
