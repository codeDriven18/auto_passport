import { UserRole } from '@/models/auth';

const ROLE_BY_NAME: Record<string, UserRole> = {
  jobseeker: UserRole.JobSeeker,
  company: UserRole.Company,
  admin: UserRole.Admin,
};

export function parseUserRole(value: unknown): UserRole {
  if (value === UserRole.JobSeeker || value === UserRole.Company || value === UserRole.Admin) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized in ROLE_BY_NAME) {
      return ROLE_BY_NAME[normalized];
    }

    const numeric = Number(value);
    if (numeric === UserRole.JobSeeker || numeric === UserRole.Company || numeric === UserRole.Admin) {
      return numeric;
    }
  }

  return UserRole.JobSeeker;
}
