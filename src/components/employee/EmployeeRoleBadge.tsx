import type { UserRole } from "../../constants/userRoles";
import { USER_ROLES, getRoleLabel } from "../../constants/userRoles";

interface EmployeeRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const BADGE_BASE_STYLES =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "bg-purple-500/15 text-purple-400",
  [USER_ROLES.SUPERVISOR]: "bg-indigo-500/15 text-indigo-400",
  [USER_ROLES.EMPLOYEE]: "bg-blue-500/15 text-blue-400",
};

export function EmployeeRoleBadge({ role, className }: EmployeeRoleBadgeProps) {
  const roleStyles =
    ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES[USER_ROLES.EMPLOYEE];
  const composedClassName = className
    ? `${BADGE_BASE_STYLES} ${roleStyles} ${className}`
    : `${BADGE_BASE_STYLES} ${roleStyles}`;

  return (
    <span className={composedClassName}>
      {getRoleLabel(role)}
    </span>
  );
}
