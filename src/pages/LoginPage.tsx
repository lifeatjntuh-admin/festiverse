import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

export default function LoginPage() {
    const { t } = useTranslation()

    const handleGoogleSignIn = () => {
        // TODO: Implement Firebase Google Auth
        console.log('Google Sign-In clicked')
    }

    return (
        <div className="min-h-dvh bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex flex-col items-center justify-center p-6">
            {/* Decorative blurs */}
            <div className="fixed top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl" />
            <div className="fixed bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-orange-500 opacity-10 rounded-full blur-3xl" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-display font-bold text-3xl tracking-tight mb-6 border border-white/20">
                        FV
                    </div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">
                        {t('app.name')}
                    </h1>
                    <p className="text-blue-100 mt-2 text-sm font-medium">
                        {t('login.subtitle')}
                    </p>
                </div>

                {/* Sign In Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
                        {t('login.welcome')}
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        {t('login.signInPrompt')}
                    </p>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98]"
                    >
                        {/* Google Icon */}
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        {t('login.continueWithGoogle')}
                    </button>

                    <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                        {t('login.termsNotice')}
                    </p>
                </div>
            </div>
        </div>
    )
}
