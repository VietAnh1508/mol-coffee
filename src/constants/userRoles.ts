export const USER_ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Helper functions for type checking
export const isAdmin = (role: string): boolean => role === USER_ROLES.ADMIN;
export const isEmployee = (role: string): boolean =>
  role === USER_ROLES.EMPLOYEE;
