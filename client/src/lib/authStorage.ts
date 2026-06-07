import type { UserRole } from '@/models/auth';
import type { CompanyStatus } from '@/models/operations';

const ACCESS_TOKEN_KEY = 'swipejobs-access-token';
const REFRESH_TOKEN_KEY = 'swipejobs-refresh-token';
const AUTH_USER_KEY = 'swipejobs-auth-user';

export interface StoredAuthUser {
  id: string;
  email: string;
  profileId: string | null;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
  companyStatus: CompanyStatus | null;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredAuthUser(): StoredAuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthUser>;
    if (!parsed.id || !parsed.email) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      profileId: parsed.profileId ?? null,
      role: parsed.role ?? 0,
      companyId: parsed.companyId ?? null,
      companyName: parsed.companyName ?? null,
      companyStatus: parsed.companyStatus ?? null,
    };
  } catch {
    return null;
  }
}

export function setAuthSession(
  accessToken: string,
  refreshToken: string,
  user: StoredAuthUser,
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function updateStoredAuthUser(user: StoredAuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function hasAuthSession(): boolean {
  return Boolean(getRefreshToken());
}
