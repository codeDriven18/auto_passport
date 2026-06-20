import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { portalMessagingApi } from '@/api/messagingApi';
import { ChatConversationSkeleton } from '@/components/messaging/ChatConversationSkeleton';
import { ChatView } from '@/components/messaging/ChatView';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { RecruiterChatActions } from '@/portal/components/RecruiterChatActions';
import ws from '@/portal/workspace.module.css';
import type { ConversationDetail } from '@/models/messaging';

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { refresh: refreshUnread } = useUnreadMessages();

  const loadConversation = useCallback(
    (showSkeleton: boolean) => {
      if (!conversationId) return;
      if (showSkeleton) setLoading(true);
      portalMessagingApi.getConversation(conversationId)
        .then(setConversation)
        .catch(() => setConversation(null))
        .finally(() => setLoading(false));
    },
    [conversationId],
  );

  useEffect(() => {
    loadConversation(true);
  }, [loadConversation]);

  if (loading) return <ChatConversationSkeleton />;
  if (!conversation || !conversationId) {
    return (
      <EmptyState
        illustration="applications"
        title="Conversation not found"
        description="This chat may have been removed or you do not have access."
        actions={[{ label: 'Back to inbox', to: '/portal/messages', primary: true }]}
      />
    );
  }

  return (
    <div className={ws.conversationWithActions}>
      <RecruiterChatActions
        applicationId={conversation.applicationId}
        status={conversation.applicationStatus}
        onChanged={() => loadConversation(false)}
      />
      <ChatView
        conversation={conversation}
        backTo="/portal/messages"
        backLabel="Back to inbox"
        title={conversation.candidateName}
        subtitle={conversation.jobTitle}
        layout="portal"
        fullscreen={false}
        embedded
        api={{
          getMessages: portalMessagingApi.getMessages,
          sendMessage: portalMessagingApi.sendMessage,
          sendAttachment: portalMessagingApi.sendAttachment,
          markRead: portalMessagingApi.markRead,
          downloadAttachment: portalMessagingApi.downloadAttachment,
        }}
        onMessagesRead={() => void refreshUnread()}
      />
    </div>
  );
}
