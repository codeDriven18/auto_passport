import { Link } from 'react-router-dom';
import { CompanyAvatar } from '@/components/profile/CompanyAvatar';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { formatMessageTime } from '@/lib/messagingHelpers';
import type { ConversationSummary } from '@/models/messaging';
import styles from './ConversationList.module.css';

interface ConversationListProps {
  conversations: ConversationSummary[];
  basePath: string;
  showCandidate?: boolean;
}

export function ConversationList({
  conversations,
  basePath,
  showCandidate = false,
}: ConversationListProps) {
  return (
    <ul className={styles.list}>
      {conversations.map((conversation) => {
        const title = showCandidate ? conversation.candidateName : conversation.companyName;
        const hasUnread = conversation.unreadCount > 0;
        const preview = conversation.latestMessageText?.trim()
          || (showCandidate ? conversation.jobTitle : `Re: ${conversation.jobTitle}`);
        const nameParts = conversation.candidateName.trim().split(/\s+/);

        return (
          <li key={conversation.id}>
            <Link
              to={`${basePath}/${conversation.id}`}
              className={`${styles.item} ${hasUnread ? styles.itemUnread : ''}`}
            >
              <div className={styles.avatarWrap}>
                {showCandidate ? (
                  <UserAvatar
                    profile={{
                      firstName: nameParts[0] ?? '',
                      lastName: nameParts.slice(1).join(' '),
                      email: '',
                      profileImageUrl: conversation.candidateProfileImageUrl,
                    }}
                    size="sm"
                    className={styles.avatar}
                  />
                ) : (
                  <CompanyAvatar
                    company={{ name: conversation.companyName, logoUrl: conversation.companyLogoUrl }}
                    size="sm"
                    className={styles.avatar}
                  />
                )}
                {conversation.canSendMessages && (
                  <span className={styles.onlineDot} aria-hidden title="Active" />
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.row}>
                  <strong className={styles.name}>{title}</strong>
                  {conversation.latestMessageAt && (
                    <time dateTime={conversation.latestMessageAt} className={styles.time}>
                      {formatMessageTime(conversation.latestMessageAt)}
                    </time>
                  )}
                </div>
                <p className={styles.jobLine}>{conversation.jobTitle}</p>
                <div className={styles.previewRow}>
                  <p className={styles.preview}>{preview}</p>
                  {hasUnread && (
                    <span className={styles.unread} aria-label={`${conversation.unreadCount} unread`}>
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
