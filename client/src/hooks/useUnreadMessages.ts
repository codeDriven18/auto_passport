import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { messagingApi, portalMessagingApi } from '@/api/messagingApi';
import { UserRole } from '@/models/auth';

export function useUnreadMessages() {
  const { isAuthenticated, user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCount(0);
      return;
    }

    try {
      if (user.role === UserRole.Company) {
        const result = await portalMessagingApi.getUnreadCount();
        setCount(result.count);
        return;
      }

      if (user.role === UserRole.JobSeeker) {
        const result = await messagingApi.getUnreadCount();
        setCount(result.count);
        return;
      }

      setCount(0);
    } catch {
      setCount(0);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { count, refresh };
}
