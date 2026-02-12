import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from '@/layouts/AppLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/useAuthStore'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const SchedulePage = lazy(() => import('@/pages/SchedulePage'))
const StallsPage = lazy(() => import('@/pages/StallsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))



/**
 * Guest guard: redirects to / if already authenticated
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isInitialized } = useAuthStore()

    if (!isInitialized || isLoading) {
        return <LoadingSpinner fullScreen />
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    const initialize = useAuthStore((s) => s.initialize)

    // Initialize Firebase auth listener on mount
    useEffect(() => {
        const unsubscribe = initialize()
        return unsubscribe
    }, [initialize])

    return (
        <BrowserRouter>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                }}
            />
            <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                    {/* Guest-only route */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />

                    {/* Public browsing routes — no login required */}
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/stalls" element={<StallsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Event detail — public viewing, login prompted for actions */}
                        <Route path="/events/:id" element={<EventDetailPage />} />
                    </Route>

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
