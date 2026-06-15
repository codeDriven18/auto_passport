import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '@/lib/authStorage';
import { HUB_CONFIG } from '@/api/hubConfig';
import { useAuth } from '@/context/AuthContext';
import type { ChatMessage } from '@/models/messaging';

interface UseChatHubOptions {
  conversationId?: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (senderUserId: string) => void;
  onRead?: (readerUserId: string) => void;
}

function normalizeMessage(message: ChatMessage, currentUserId?: string): ChatMessage {
  const isSystem = message.isSystem ?? message.type === 'System';
  return {
    ...message,
    type: isSystem ? 'System' : 'User',
    isSystem,
    isMine: !isSystem && !!currentUserId && message.senderUserId === currentUserId,
  };
}

export function useChatHub({
  conversationId,
  onMessage,
  onTyping,
  onRead,
}: UseChatHubOptions) {
  const { isAuthenticated, user } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const currentUserId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;

    let cancelled = false;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_CONFIG.chatUrl, {
        accessTokenFactory: () => getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('MessageReceived', (message: ChatMessage) => {
      onMessage?.(normalizeMessage(message, currentUserId));
    });
    connection.on('Typing', (payload: { senderUserId: string }) => {
      onTyping?.(payload.senderUserId);
    });
    connection.on('MessagesRead', (payload: { readerUserId: string }) => {
      onRead?.(payload.readerUserId);
    });

    connectionRef.current = connection;

    void (async () => {
      try {
        await connection.start();
        if (cancelled) return;
        await connection.invoke('JoinConversation', conversationId);
      } catch {
        // Realtime is optional.
      }
    })();

    return () => {
      cancelled = true;
      void connection.invoke('LeaveConversation', conversationId).catch(() => undefined);
      void connection.stop();
      connectionRef.current = null;
    };
  }, [conversationId, currentUserId, isAuthenticated, onMessage, onRead, onTyping]);

  const sendTyping = () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected || !conversationId) {
      return;
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    void connection.invoke('SendTyping', conversationId);
    typingTimeoutRef.current = window.setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1200);
  };

  return { sendTyping };
}
