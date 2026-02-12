import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    fullScreen?: boolean
    className?: string
}

export default function LoadingSpinner({ fullScreen, className }: LoadingSpinnerProps) {
    const spinner = (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                {spinner}
            </div>
        )
    }

    return spinner
}
