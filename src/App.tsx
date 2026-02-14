import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from '@/layouts/AppLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/useAuthStore'
import { ThemeProvider } from '@/components/theme-provider'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const SchedulePage = lazy(() => import('@/pages/SchedulePage'))
const StallsPage = lazy(() => import('@/pages/StallsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const OrganiserTools = lazy(() => import('@/pages/organiser/OrganiserTools'))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))



/**
 * Guest guard: redirects to / if already authenticated
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, initialized } = useAuthStore()

    if (!initialized || isLoading) {
        return <LoadingSpinner fullScreen />
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    // Auth listener is initialized in useAuthStore.ts


    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/organiser" element={<OrganiserTools />} />

                            {/* Event detail — public viewing, login prompted for actions */}
                            <Route path="/events/:id" element={<EventDetailPage />} />
                        </Route>

                        {/* 404 catch-all */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
