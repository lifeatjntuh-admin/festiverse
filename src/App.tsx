import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from '@/layouts/AppLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const SchedulePage = lazy(() => import('@/pages/SchedulePage'))
const StallsPage = lazy(() => import('@/pages/StallsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))

function App() {
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
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/stalls" element={<StallsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/events/:id" element={<EventDetailPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
