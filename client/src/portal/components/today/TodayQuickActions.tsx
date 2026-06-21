import { Link } from 'react-router-dom';
import {
  IconBriefcase,
  IconBuilding,
  IconClipboard,
  IconMail,
} from '@/components/icons/Icons';
import { TodaySection } from '@/portal/components/today/TodaySection';
import ws from '@/portal/workspace.module.css';

const ACTIONS = [
  { to: '/portal/jobs', label: 'Create role', icon: IconBriefcase },
  { to: '/portal/pipeline', label: 'Open pipeline', icon: IconClipboard },
  { to: '/portal/messages', label: 'Open inbox', icon: IconMail },
  { to: '/portal/company', label: 'Company profile', icon: IconBuilding },
  { to: '/portal/pipeline', label: 'Schedule interview', icon: IconClipboard },
] as const;

export function TodayQuickActions() {
  return (
    <TodaySection title="Quick actions">
      <div className={ws.todayQuickActions}>
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link key={label} to={to} className={ws.todayQuickAction}>
            <Icon className={ws.todayQuickActionIcon} size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </TodaySection>
  );
}
