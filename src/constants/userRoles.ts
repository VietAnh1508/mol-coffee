export const USER_ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  EMPLOYEE: "employee",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Quản trị viên",
  [USER_ROLES.SUPERVISOR]: "Giám sát",
  [USER_ROLES.EMPLOYEE]: "Nhân viên",
};

export const isAdmin = (role?: string | null): boolean =>
  role === USER_ROLES.ADMIN;
export const isSupervisor = (role?: string | null): boolean =>
  role === USER_ROLES.SUPERVISOR;
export const isEmployee = (role?: string | null): boolean =>
  role === USER_ROLES.EMPLOYEE;

export const canAccessManagement = (role?: string | null): boolean =>
  role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERVISOR;
export const canManageResources = (role?: string | null): boolean =>
  role === USER_ROLES.ADMIN;

export const getRoleLabel = (role?: string | null): string =>
  (role && ROLE_LABELS[role as UserRole]) || "Không xác định";
