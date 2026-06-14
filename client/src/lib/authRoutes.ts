import { UserRole } from '@/models/auth';

export function getHomeRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return '/admin';
    case UserRole.Company:
      return '/portal';
    default:
      return '/';
  }
}

export function getPostLoginDestination(role: UserRole, from?: string): string {
  if (role === UserRole.Admin) return '/admin';
  if (role === UserRole.Company) return '/portal';
  if (from && !from.startsWith('/admin') && !from.startsWith('/portal') && from !== '/login') {
    return from;
  }
  return '/';
}
