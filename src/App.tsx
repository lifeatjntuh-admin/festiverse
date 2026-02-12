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

/**
 * Auth guard for deep pages: redirects to /login if not authenticated
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isInitialized } = useAuthStore()

    if (!isInitialized || isLoading) {
        return <LoadingSpinner fullScreen />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

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

                        {/* Deeper pages — login required */}
                        <Route
                            path="/events/:id"
                            element={
                                <RequireAuth>
                                    <EventDetailPage />
                                </RequireAuth>
                            }
                        />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
