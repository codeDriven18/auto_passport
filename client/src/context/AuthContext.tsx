import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyAuthResponse, refreshAuthSession } from '@/api/client';
import { authApi } from '@/api/authApi';
import {
  clearAuthSession,
  getRefreshToken,
  getStoredAuthUser,
  type StoredAuthUser,
} from '@/lib/authStorage';
import { toStoredAuthUser } from '@/lib/authUser';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/models/auth';

interface AuthContextValue {
  user: StoredAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(response: AuthResponse) {
  applyAuthResponse(response);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAuthUser | null>(() => getStoredAuthUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(toStoredAuthUser(me));
    } catch {
      setUser(getStoredAuthUser());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getRefreshToken()) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const ok = await refreshAuthSession();
      if (cancelled) return;

      if (!ok) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(getStoredAuthUser());
      try {
        const me = await authApi.me();
        if (!cancelled) {
          setUser(toStoredAuthUser(me));
        }
      } catch {
        /* stored user is enough */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    applySession(response);
    setUser(toStoredAuthUser(response.user));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    applySession(response);
    setUser(toStoredAuthUser(response.user));
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && getRefreshToken()),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
