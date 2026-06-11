import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '@/lib/authStorage';
import { useAuth } from '@/context/AuthContext';
import type { AppNotification } from '@/models/personalization';
import { HUB_CONFIG } from '@/api/hubConfig';

export type HubConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

function logSignalR(message: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.info(`[SignalR] ${message}`, detail ?? '');
  }
}

interface UseNotificationHubOptions {
  onReceived: (notification: AppNotification) => void;
  onStateChange?: (state: HubConnectionState) => void;
}

export function useNotificationHub({ onReceived, onStateChange }: UseNotificationHubOptions) {
  const { isAuthenticated, user } = useAuth();
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    if (!isAuthenticated || !user?.profileId) {
      onStateChangeRef.current?.('disconnected');
      return;
    }

    const setState = (state: HubConnectionState) => {
      onStateChangeRef.current?.(state);
    };

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_CONFIG.notificationsUrl, {
        accessTokenFactory: () => getAccessToken() ?? '',
        transport:
          signalR.HttpTransportType.WebSockets
          | signalR.HttpTransportType.ServerSentEvents
          | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
      )
      .build();

    connection.on('NotificationReceived', (notification: AppNotification) => {
      onReceived(notification);
    });

    connection.onreconnecting((error) => {
      logSignalR('Reconnecting...', error?.message);
      setState('reconnecting');
    });

    connection.onreconnected((connectionId) => {
      logSignalR('Reconnected', connectionId);
      setState('connected');
    });

    connection.onclose((error) => {
      if (error) {
        logSignalR('Connection closed with error', error.message);
      } else {
        logSignalR('Connection closed');
      }
      setState('disconnected');
    });

    let cancelled = false;
    setState('connecting');

    void (async () => {
      try {
        logSignalR('Starting connection', HUB_CONFIG.notificationsUrl);
        await connection.start();
        if (!cancelled) {
          logSignalR('Connected', connection.state);
          setState('connected');
        }
      } catch (error) {
        if (!cancelled) {
          logSignalR('Failed to start notification hub', error);
          setState('disconnected');
        }
      }
    })();

    return () => {
      cancelled = true;
      setState('disconnected');
      void connection.stop();
    };
  }, [isAuthenticated, user?.profileId, onReceived]);
}
