import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { profilesApi } from '@/api/profilesApi';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/models/userProfile';

export function useProfile() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const p = await profilesApi.getMe();
      setProfile(p);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setProfile(null);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  return { profile, loading: authLoading || loading, error, reload: load, setProfile };
}
