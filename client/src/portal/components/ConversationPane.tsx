import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalMessagingApi } from '@/api/messagingApi';
import { ChatConversationSkeleton } from '@/components/messaging/ChatConversationSkeleton';
import { ChatView } from '@/components/messaging/ChatView';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { ConversationContextPanel } from '@/portal/components/ConversationContextPanel';
import { RecruiterChatActions } from '@/portal/components/RecruiterChatActions';
import ws from '@/portal/workspace.module.css';
import type { ConversationDetail } from '@/models/messaging';

const CONTEXT_STORAGE_KEY = 'swipejobs.portal.chatContextOpen';

interface ConversationPaneProps {
  conversationId: string;
  mode?: 'primary' | 'split';
  showContext?: boolean;
  onClose?: () => void;
}

export function ConversationPane({
  conversationId,
  mode = 'primary',
  showContext = true,
  onClose,
}: ConversationPaneProps) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [contextOpen, setContextOpen] = useState(() => {
    try {
      return localStorage.getItem(CONTEXT_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const { refresh: refreshUnread } = useUnreadMessages();
  const navigate = useNavigate();
  const isSplit = mode === 'split';

  const toggleContext = useCallback(() => {
    setContextOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CONTEXT_STORAGE_KEY, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

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

  if (loading) {
    return (
      <div className={[ws.msgPane, isSplit ? ws.msgPaneSplit : ''].filter(Boolean).join(' ')}>
        <ChatConversationSkeleton />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={[ws.msgPane, isSplit ? ws.msgPaneSplit : ''].filter(Boolean).join(' ')}>
        <EmptyState
          illustration="applications"
          title="Conversation not found"
          description="This chat may have been removed or you do not have access."
          actions={[{
            label: isSplit ? 'Close panel' : 'Back to inbox',
            onClick: () => (isSplit && onClose ? onClose() : navigate('/portal/messages')),
            primary: true,
          }]}
        />
      </div>
    );
  }

  const contextVisible = showContext && !isSplit && contextOpen;

  return (
    <div className={[ws.msgPane, isSplit ? ws.msgPaneSplit : ''].filter(Boolean).join(' ')}>
      {isSplit && (
        <div className={ws.msgSplitHeader}>
          <span className={ws.msgSplitLabel}>Split view</span>
          <button type="button" className={ws.msgSplitClose} onClick={onClose} aria-label="Close split conversation">
            Close
          </button>
        </div>
      )}

      <div className={ws.msgPaneBody}>
        <div className={ws.msgPaneChat}>
          {isSplit && (
            <RecruiterChatActions
              applicationId={conversation.applicationId}
              status={conversation.applicationStatus}
              variant="compact"
              onChanged={() => loadConversation(false)}
            />
          )}
          <ChatView
            conversation={conversation}
            backTo="/portal/messages"
            backLabel="Back to inbox"
            title={conversation.candidateName}
            headerHint={conversation.jobTitle}
            showStatusBadge={false}
            onHeaderIdentityClick={showContext && !isSplit ? toggleContext : undefined}
            headerIdentityExpanded={contextVisible}
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

        {showContext && !isSplit && (
          <div className={[
            ws.msgContextCollapsible,
            contextOpen ? '' : ws.msgContextCollapsibleClosed,
          ].filter(Boolean).join(' ')}>
            <ConversationContextPanel
              applicationId={conversation.applicationId}
              onUpdated={() => loadConversation(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
