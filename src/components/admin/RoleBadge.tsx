import { UserRole } from '@/types/database'

const ROLE_COLORS: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    app_admin: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    event_manager: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    stall_manager: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    team_member: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    attendee: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
}

const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    app_admin: 'App Admin',
    event_manager: 'Event Manager',
    stall_manager: 'Stall Manager',
    team_member: 'Team Member',
    attendee: 'Attendee',
}

interface RoleBadgeProps {
    role: UserRole | UserRole[]
    className?: string
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
    const roles = Array.isArray(role) ? role : [role]

    return (
        <div className="flex gap-1 flex-wrap justify-center">
            {roles.map(r => (
                <span
                    key={r}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ROLE_COLORS[r] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'} ${className}`}
                >
                    {ROLE_LABELS[r] || r}
                </span>
            ))}
        </div>
    )
}
