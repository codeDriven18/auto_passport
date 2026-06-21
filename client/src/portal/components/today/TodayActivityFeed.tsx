import { Link } from 'react-router-dom';
import {
  IconBriefcase,
  IconClipboard,
  IconFileText,
  IconMail,
  IconUser,
  IconX,
} from '@/components/icons/Icons';
import { formatMessageTime } from '@/lib/messagingHelpers';
import {
  resolveActivityHref,
  resolveActivityIcon,
  type ActivityIconKind,
} from '@/lib/employer/todayWorkspace';
import type { PortalWorkspaceActivity } from '@/models/workspaceActivity';
import { TodaySection } from '@/portal/components/today/TodaySection';
import ws from '@/portal/workspace.module.css';

function ActivityIcon({ kind }: { kind: ActivityIconKind }) {
  const className = ws.todayActivityIcon;
  switch (kind) {
    case 'message':
      return <IconMail className={className} size={14} />;
    case 'interview':
      return <IconClipboard className={className} size={14} />;
    case 'role':
      return <IconBriefcase className={className} size={14} />;
    case 'reject':
      return <IconX className={className} size={14} />;
    case 'offer':
    case 'application':
      return <IconFileText className={className} size={14} />;
    case 'note':
      return <IconFileText className={className} size={14} />;
    default:
      return <IconUser className={className} size={14} />;
  }
}

interface TodayActivityFeedProps {
  activities: PortalWorkspaceActivity[];
}

export function TodayActivityFeed({ activities }: TodayActivityFeedProps) {
  return (
    <TodaySection title="Recent activity">
      {activities.length === 0 ? (
        <p className={ws.todayInlineEmpty}>No recent hiring activity yet.</p>
      ) : (
        <ul className={ws.todayActivityList}>
          {activities.map((activity, index) => {
            const href = resolveActivityHref(activity);
            const iconKind = resolveActivityIcon(activity);
            const key = `${activity.occurredAt}-${activity.message}-${index}`;
            const content = (
              <>
                <span className={ws.todayActivityIconWrap} aria-hidden>
                  <ActivityIcon kind={iconKind} />
                </span>
                <span className={ws.todayActivityText}>{activity.message}</span>
                <time className={ws.todayActivityTime} dateTime={activity.occurredAt}>
                  {formatMessageTime(activity.occurredAt)}
                </time>
              </>
            );

            return (
              <li key={key} className={ws.todayActivityItem}>
                {href ? (
                  <Link to={href} className={ws.todayActivityLink}>{content}</Link>
                ) : (
                  <div className={ws.todayActivityStatic}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </TodaySection>
  );
}
