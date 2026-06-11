import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationsApi } from '@/api/notificationsApi';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/auth';
import { useNotificationHub } from '@/hooks/useNotificationHub';
import type { AppNotification } from '@/models/personalization';

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const { isAuthenticated, user } = useAuth();
  const isJobSeeker = user?.role === UserRole.JobSeeker;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!isAuthenticated || !isJobSeeker) {
      setNotifications([]);
      setUnreadCount(0);
      seenIds.current.clear();
      return;
    }

    setLoading(true);
    try {
      const [items, countResult] = await Promise.all([
        notificationsApi.getMine(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(countResult.count);
      items.forEach((n) => seenIds.current.add(n.id));
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isJobSeeker]);

  const handleRealtime = useCallback((notification: AppNotification) => {
    if (seenIds.current.has(notification.id)) return;
    seenIds.current.add(notification.id);
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((c) => c + 1);
    }
  }, []);

  useNotificationHub(handleRealtime);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isAuthenticated || !isJobSeeker) return;
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, isJobSeeker, load]);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    if (!isAuthenticated) return;
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markRead, markAllRead, reload: load };
}
