import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/useAuthStore'
import { useUserStats, useBookmarks } from '@/lib/useData'
import RoleBadge from '@/components/admin/RoleBadge'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, profile, signInWithGoogle, signOut, deleteAccount, isLoading } = useAuthStore()
    const { stats } = useUserStats(user?.uid)
    const { bookmarkCount } = useBookmarks(user?.uid)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const isLoggedIn = !!user

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
            toast.success(t('auth.welcome') + ' 🎉')
        } catch {
            toast.error(t('auth.signInFailed'))
        }
    }

    const handleSignOut = async () => {
        await signOut()
        toast.success(t('auth.signedOut'))
        navigate('/', { replace: true })
    }

    // Derive display values
    const displayName = profile?.name || user?.displayName || t('profile.guest')
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
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-primary-400 to-secondary-400 mb-3 relative group">
                    {isLoggedIn && avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full rounded-full border-4 border-white object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-primary/10 border-4 border-card flex items-center justify-center text-primary text-3xl font-bold font-display">
                            {isLoggedIn ? initials : '?'}
                        </div>
                    )}
                    {/* Role Badge Overlay — removed from avatar to prevent overlap */}
                </div>
                <h2 className="text-xl font-bold text-foreground mt-4">{displayName}</h2>
                {isLoggedIn ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{displayEmail}</p>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('profile.signInPrompt')}</p>
                )}

                {/* Role Badges - below name/email */}
                {isLoggedIn && profile?.roles && profile.roles.length > 0 && (
                    <div className="mt-2">
                        <RoleBadge role={profile.roles} />
                    </div>
                )}

                {/* Sign In / Sign Out Button */}
                {!isLoggedIn ? (
                    <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="mt-4 mx-auto flex items-center justify-center gap-2.5 bg-card hover:bg-muted/50 border border-border rounded-xl px-6 py-3 text-sm font-semibold text-card-foreground transition-all duration-200 active:scale-[0.98] shadow-sm disabled:opacity-60"
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
                        {isLoading ? t('auth.signingIn') : t('auth.signInWithGoogle')}
                    </button>
                ) : null}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 mb-8">
                    {[
                        { label: t('profile.events'), value: String(stats.eventsRegistered), to: '/schedule?view=registered' },
                        { label: t('profile.saved'), value: String(bookmarkCount), to: '/schedule?view=saved' },
                        { label: t('profile.stallsVisited'), value: String(stats.stallsVisited), to: '/stalls?view=saved' },
                    ].map(({ label, value, to }) => (
                        <div
                            key={label}
                            onClick={() => navigate(to)}
                            className="p-3 bg-card rounded-xl border border-border shadow-sm cursor-pointer active:scale-[0.97] transition-transform"
                        >
                            <div className="text-xl font-bold text-card-foreground">{value}</div>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Role Specific Actions */}
                <div className="mb-4 space-y-3">
                    {/* Admin Dashboard */}
                    {isLoggedIn && (profile?.roles?.some((r: string) => ['super_admin', 'app_admin'].includes(r))) && (
                        <Link to="/admin" className="w-full p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg border border-white/20 flex items-center justify-between text-white active:scale-[0.99] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Icon icon="solar:shield-user-bold" width={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">{t('profile.adminDashboard')}</div>
                                    <div className="text-[10px] text-white/80">{t('profile.manageUsersRoles')}</div>
                                </div>
                            </div>
                            <Icon icon="solar:alt-arrow-right-linear" />
                        </Link>
                    )}

                    {/* Organizer/Manager Dashboard */}
                    {isLoggedIn && (profile?.roles?.some((r: string) => ['super_admin', 'app_admin', 'event_manager', 'stall_manager', 'team_member'].includes(r))) && (
                        <Link to="/organiser" className="w-full p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg border border-white/20 flex items-center justify-between text-white active:scale-[0.99] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Icon icon="solar:widget-linear" width={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">{t('profile.organizerTools')}</div>
                                    <div className="text-[10px] text-white/80">{t('profile.manageYourEventsStalls')}</div>
                                </div>
                            </div>
                            <Icon icon="solar:alt-arrow-right-linear" />
                        </Link>
                    )}

                    {/* Request Role */}
                    {isLoggedIn && !profile?.roles?.includes('super_admin') && !profile?.role_request && (
                        <div className="w-full p-4 bg-card rounded-xl border border-border shadow-sm text-left space-y-3">
                            <h3 className="font-semibold text-card-foreground text-sm">{t('profile.requestRoles')}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('profile.requestRolesDesc')}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => useAuthStore.getState().requestRole('event_manager')}
                                    className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-100 dark:border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-400 text-xs font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <Icon icon="solar:calendar-add-linear" width={20} />
                                    {t('profile.roleEventManager')}
                                </button>
                                <button
                                    onClick={() => useAuthStore.getState().requestRole('stall_manager')}
                                    className="p-3 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border border-orange-100 dark:border-orange-500/20 rounded-lg text-orange-700 dark:text-orange-400 text-xs font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <Icon icon="solar:shop-2-linear" width={20} />
                                    {t('profile.roleStallManager')}
                                </button>
                            </div>
                            <button
                                onClick={() => useAuthStore.getState().requestRole('team_member')}
                                className="w-full text-xs text-gray-400 hover:text-foreground font-medium py-1"
                            >
                                {t('profile.roleTeamMemberNote')}
                            </button>
                        </div>
                    )}

                    {/* Request Pending */}
                    {isLoggedIn && profile?.role_request && (
                        <div className="w-full p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between text-yellow-600 dark:text-yellow-500">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Icon icon="solar:clock-circle-linear" width={18} />
                                </div>
                                <div className="text-left">
                                    <span className="font-semibold text-sm block">{t('profile.requestPending')}</span>
                                    <span className="text-xs opacity-80 uppercase font-bold tracking-wider">{profile.role_request.replace('_', ' ')}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => useAuthStore.getState().cancelRoleRequest()}
                                className="text-xs font-semibold hover:text-red-500 underline decoration-yellow-600/30 dark:decoration-yellow-500/30 hover:decoration-red-500/30 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu Items */}
                <div className="space-y-3 text-left">
                    <button className="w-full p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Icon icon="solar:ticket-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-card-foreground">{t('profile.myTickets')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <Icon icon="solar:bookmark-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-card-foreground">{t('profile.savedEvents')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Icon icon="solar:bell-bing-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-card-foreground">{t('profile.notifications')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>

                    <button className="w-full p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                                <Icon icon="solar:settings-linear" width={18} />
                            </div>
                            <span className="font-semibold text-sm text-card-foreground">{t('profile.settings')}</span>
                        </div>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                    </button>
                </div>

                {isLoggedIn && (
                    <>
                        <button
                            onClick={handleSignOut}
                            disabled={isLoading}
                            className="mt-8 w-full p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-60"
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
                                {t('profile.deleteAccount')}
                            </button>
                        ) : (
                            <div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">
                                    {t('profile.deleteConfirmText')}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                await deleteAccount()
                                                toast.success(t('auth.accountDeleted'))
                                                navigate('/', { replace: true })
                                            } catch {
                                                toast.error(t('auth.accountDeleteFailed'))
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                                    >
                                        {isLoading ? t('profile.deleting') : t('profile.confirmDeleteYes')}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-2.5 bg-card text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold border border-border"
                                    >
                                        {t('common.cancel')}
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
