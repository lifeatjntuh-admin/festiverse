import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/useAuthStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, profile, signInWithGoogle, signOut, deleteAccount, isLoading } = useAuthStore()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const isLoggedIn = !!user

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
            toast.success('Welcome to Festiverse! 🎉')
        } catch {
            toast.error('Sign-in failed. Please try again.')
        }
    }

    const handleSignOut = async () => {
        await signOut()
        toast.success('Signed out successfully')
        navigate('/', { replace: true })
    }

    // Derive display values
    const displayName = profile?.name || user?.displayName || 'Guest User'
    const displayEmail = profile?.email || user?.email || ''
    const avatarUrl = profile?.avatar_url || user?.photoURL || ''
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="animate-fade-in">
            <div className="p-4 pt-8 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-primary-400 to-secondary-400 mb-3">
                    {isLoggedIn && avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full rounded-full border-4 border-white object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-primary-100 border-4 border-white flex items-center justify-center text-primary-600 text-3xl font-bold font-display">
                            {isLoggedIn ? initials : '?'}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                {isLoggedIn ? (
                    <p className="text-sm text-gray-500 font-medium">{displayEmail}</p>
                ) : (
                    <p className="text-sm text-gray-500 font-medium">Sign in to access all features</p>
                )}

                {/* Sign In / Sign Out Button */}
                {!isLoggedIn ? (
                    <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="mt-4 mx-auto flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] shadow-sm disabled:opacity-60"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                        )}
                        {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </button>
                ) : null}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 mb-8">
                    {[
                        { label: t('profile.events'), value: '0' },
                        { label: t('profile.saved'), value: '0' },
                        { label: t('profile.points'), value: '0' },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-xl font-bold text-gray-900">{value}</div>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Menu Items */}
                <div className="space-y-3 text-left">
                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Icon icon="solar:ticket-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.myTickets')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Icon icon="solar:bookmark-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.savedEvents')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Icon icon="solar:bell-bing-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.notifications')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center">
                                <Icon icon="solar:settings-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">{t('profile.settings')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>
                </div>

                {isLoggedIn && (
                    <>
                        <button
                            onClick={handleSignOut}
                            disabled={isLoading}
                            className="mt-8 w-full p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-60"
                        >
                            <Icon icon="solar:logout-2-linear" width={18} className="text-red-500" />
                            <span className="text-sm font-semibold text-red-500">{t('profile.signOut')}</span>
                        </button>

                        {/* Delete Account */}
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="mt-3 w-full py-2 text-xs font-medium text-gray-400 hover:text-red-400 transition-colors"
                            >
                                Delete my account
                            </button>
                        ) : (
                            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700 font-medium mb-3">
                                    Are you sure? Your profile and data will be deactivated.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                await deleteAccount()
                                                toast.success('Account deleted')
                                                navigate('/', { replace: true })
                                            } catch {
                                                toast.error('Failed to delete account')
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                                    >
                                        {isLoading ? 'Deleting...' : 'Yes, delete'}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-2.5 bg-white text-gray-600 rounded-lg text-sm font-semibold border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
