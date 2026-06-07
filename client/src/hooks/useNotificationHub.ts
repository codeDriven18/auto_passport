import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '@/lib/authStorage';
import { useAuth } from '@/context/AuthContext';
import type { AppNotification } from '@/models/personalization';
import { HUB_CONFIG } from '@/api/hubConfig';

export function useNotificationHub(onReceived: (notification: AppNotification) => void) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.profileId) return;

    const token = getAccessToken();
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_CONFIG.notificationsUrl}?access_token=${encodeURIComponent(token)}`)
      .withAutomaticReconnect()
      .build();

    connection.on('NotificationReceived', (notification: AppNotification) => {
      onReceived(notification);
    });

    let cancelled = false;

    void (async () => {
      try {
        await connection.start();
      } catch {
        if (!cancelled) {
          /* REST fallback in useNotifications handles polling */
        }
      }
    })();

    return () => {
      cancelled = true;
      void connection.stop();
    };
  }, [isAuthenticated, user?.profileId, onReceived]);
}
