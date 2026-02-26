import { UserRole } from '../contracts/auth';

export const isAdminRole = (role?: string): boolean => {
  return role === UserRole.ADMIN;
};

export const hasAnyRole = (
  role: string | undefined,
  roles: string[],
): boolean => {
  if (!role) {
    return false;
  }

  return roles.includes(role);
};
