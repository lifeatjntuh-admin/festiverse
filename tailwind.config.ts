import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                display: ['Lexend', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                secondary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                },
                accent: {
                    purple: '#a855f7',
                    green: '#10b981',
                    pink: '#ec4899',
                    yellow: '#fbbf24',
                    cyan: '#06b6d4',
                },
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                glow: '0 4px 20px -2px rgba(59, 130, 246, 0.25)',
            },
            borderRadius: {
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '20px',
                '2xl': '24px',
            },
            spacing: {
                18: '4.5rem',
                88: '22rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'slide-down': 'slideDown 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
                slideDown: {
                    from: { transform: 'translateY(-100%)' },
                    to: { transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
}

export default config
