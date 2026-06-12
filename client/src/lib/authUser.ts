import type { AuthUser } from '@/models/auth';
import type { StoredAuthUser } from '@/lib/authStorage';
import { parseUserRole } from '@/lib/userRole';

export function toStoredAuthUser(user: AuthUser): StoredAuthUser {
  return {
    id: user.id,
    email: user.email,
    profileId: user.profileId,
    role: parseUserRole(user.role),
    companyId: user.companyId,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
  };
}
