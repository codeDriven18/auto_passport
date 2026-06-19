import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portalMessagingApi } from '@/api/messagingApi';
import { ConversationList } from '@/components/messaging/ConversationList';
import ui from '@/components/employer/ui/employerUi.module.css';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import type { ConversationSummary } from '@/models/messaging';
import comp from '@/styles/employerComposition.module.css';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'interviewing', label: 'Interviewing' },
] as const;

export function PortalMessagesPage() {
  const [filter, setFilter] = useState('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { count: unreadCount, refresh: refreshUnread } = useUnreadMessages();

  useEffect(() => {
    setLoading(true);
    portalMessagingApi.listConversations(filter || undefined)
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
    void refreshUnread();
  }, [filter, location.pathname, refreshUnread]);

  const unreadInList = conversations.filter((c) => c.unreadCount > 0).length;

  return (
    <section className={`${ui.page} ${comp.focalPage} ${comp.fillViewport}`}>
      <div className={ui.workboardToolbar}>
        <div>
          <h1 className={ui.workboardToolbarTitle}>Messages</h1>
          <p className={ui.workboardToolbarMeta}>
            {conversations.length} conversations
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </p>
        </div>
        <Link to="/portal/pipeline" className={ui.btnGhost}>Pipeline</Link>
      </div>

      <div className={ui.pillRow} role="tablist" aria-label="Conversation filters">
        {FILTERS.map((item) => (
          <button key={item.id || 'all'} type="button" className={filter === item.id ? ui.pillActive : ui.pill} onClick={() => setFilter(item.id)}>
            {item.label}
            {item.id === 'unread' && unreadInList > 0 ? ` (${unreadInList})` : ''}
          </button>
        ))}
      </div>

      <div className={comp.focalDominant}>
        {loading ? (
          <p className={ui.statusText}>Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <EmptyState
            illustration="applications"
            title={filter === 'unread' ? 'No unread messages' : 'No conversations yet'}
            description={filter === 'unread' ? 'You are caught up on replies.' : 'Invite candidates to interview to unlock messaging.'}
            actions={[{ label: 'Open pipeline', to: '/portal/pipeline', primary: true }]}
          />
        ) : (
          <div className={ui.inboxPanel}>
            <ConversationList conversations={conversations} basePath="/portal/messages" showCandidate />
          </div>
        )}
      </div>
    </section>
  );
}
