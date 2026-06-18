import { NavLink } from 'react-router-dom';
import {
  PORTAL_NAV_HIRING,
  PORTAL_NAV_WORKSPACE,
  type PortalNavItem,
} from '@/components/employer/portalNav';
import { PortalBackToApp, PortalSidebarBrand } from '@/components/employer/PortalHeader';
import styles from './PortalSidebar.module.css';

interface PortalSidebarProps {
  unreadMessages: number;
  onNavigate?: () => void;
  className?: string;
}

function NavItem({
  item,
  unreadMessages,
  onNavigate,
}: {
  item: PortalNavItem;
  unreadMessages: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const badge = item.badgeKey === 'messages' && unreadMessages > 0
    ? (unreadMessages > 9 ? '9+' : unreadMessages)
    : null;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
      }
    >
      <Icon className={styles.linkIcon} />
      <span className={styles.linkLabel}>{item.label}</span>
      {badge && <span className={styles.badge}>{badge}</span>}
    </NavLink>
  );
}

function NavGroup({
  title,
  items,
  unreadMessages,
  onNavigate,
}: {
  title: string;
  items: PortalNavItem[];
  unreadMessages: number;
  onNavigate?: () => void;
}) {
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>{title}</p>
      {items.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          unreadMessages={unreadMessages}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function PortalSidebar({ unreadMessages, onNavigate, className }: PortalSidebarProps) {
  return (
    <aside className={[styles.sidebar, className].filter(Boolean).join(' ')}>
      <PortalSidebarBrand />

      <nav className={styles.nav} aria-label="Employer navigation">
        <NavGroup
          title="Hiring"
          items={PORTAL_NAV_HIRING}
          unreadMessages={unreadMessages}
          onNavigate={onNavigate}
        />
        <NavGroup
          title="Workspace"
          items={PORTAL_NAV_WORKSPACE}
          unreadMessages={unreadMessages}
          onNavigate={onNavigate}
        />
      </nav>

      <div className={styles.footer}>
        <PortalBackToApp />
      </div>
    </aside>
  );
}
