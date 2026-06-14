import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationsApi } from '@/api/notificationsApi';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/auth';
import { useNotificationHub, type HubConnectionState } from '@/hooks/useNotificationHub';
import type { AppNotification } from '@/models/personalization';

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const { isAuthenticated, user } = useAuth();
  const isJobSeeker = user?.role === UserRole.JobSeeker;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hubState, setHubState] = useState<HubConnectionState>('disconnected');
  const seenIds = useRef(new Set<string>());
  const hubConnected = hubState === 'connected' || hubState === 'reconnecting';

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

  useNotificationHub({ onReceived: handleRealtime, onStateChange: setHubState });

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isAuthenticated || !isJobSeeker || hubConnected) return;
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, isJobSeeker, hubConnected, load]);

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

  const dismiss = async (id: string) => {
    try {
      await notificationsApi.dismiss(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && !target.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch {
      void load();
    }
  };

  const dismissAll = async () => {
    if (!isAuthenticated) return;
    try {
      await notificationsApi.dismissAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      void load();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    dismiss,
    dismissAll,
    reload: load,
  };
}
