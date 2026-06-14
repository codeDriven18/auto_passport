import type { UserRole } from '@/models/auth';
import type { CompanyStatus } from '@/models/operations';
import { parseUserRole } from '@/lib/userRole';

const ACCESS_TOKEN_KEY = 'swipejobs-access-token';
const REFRESH_TOKEN_KEY = 'swipejobs-refresh-token';
const AUTH_USER_KEY = 'swipejobs-auth-user';
const SESSION_ID_KEY = 'swipejobs-session-id';
const ACCESS_EXPIRES_AT_KEY = 'swipejobs-access-expires-at';

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

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function getAccessTokenExpiresAt(): number | null {
  const raw = localStorage.getItem(ACCESS_EXPIRES_AT_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isAccessTokenExpired(bufferMs = 60_000): boolean {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - bufferMs;
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
      role: parseUserRole(parsed.role),
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
  expiresInSeconds: number,
  sessionId?: string,
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(
    ACCESS_EXPIRES_AT_KEY,
    String(Date.now() + Math.max(0, expiresInSeconds) * 1000),
  );
  if (sessionId) {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
}

export function updateStoredAuthUser(user: StoredAuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
}

export function hasAuthSession(): boolean {
  return Boolean(getRefreshToken());
}
