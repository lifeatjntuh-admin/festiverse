import { UserRole } from '@/types/database'

const ROLE_COLORS: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
    app_admin: 'bg-blue-100 text-blue-700 border-blue-200',
    event_manager: 'bg-orange-100 text-orange-700 border-orange-200',
    stall_manager: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    team_member: 'bg-green-100 text-green-700 border-green-200',
    attendee: 'bg-gray-100 text-gray-700 border-gray-200',
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ROLE_COLORS[r] || 'bg-gray-100 text-gray-800 border-gray-200'} ${className}`}
                >
                    {ROLE_LABELS[r] || r}
                </span>
            ))}
        </div>
    )
}
