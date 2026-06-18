import { Link } from 'react-router-dom';
import { IconChevronLeft } from '@/components/icons/Icons';
import { IconMessages } from '@/components/layout/NavIcons';
import { useEmployerWorkspace } from '@/context/EmployerWorkspaceContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { CompanyAvatar } from '@/components/profile/CompanyAvatar';
import styles from './PortalHeader.module.css';

interface PortalHeaderProps {
  title: string;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
}

export function PortalHeader({ title, onOpenMenu, showMenuButton }: PortalHeaderProps) {
  const { company } = useEmployerWorkspace();
  const { count: unreadMessages } = useUnreadMessages();

  return (
    <header className={styles.header}>
      <div className={styles.start}>
        {showMenuButton && (
          <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Open menu">
            <span className={styles.menuIcon} aria-hidden />
          </button>
        )}
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>{company?.name ?? 'Hiring workspace'}</p>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>

      <div className={styles.actions}>
        <Link to="/portal/messages" className={styles.iconBtn} aria-label="Messages">
          <IconMessages className={styles.msgIcon} />
          {unreadMessages > 0 && (
            <span className={styles.badge}>{unreadMessages > 9 ? '9+' : unreadMessages}</span>
          )}
        </Link>
        <Link to="/portal/company" className={styles.avatarLink} aria-label="Company profile">
          <CompanyAvatar
            company={{ name: company?.name ?? 'Company', logoUrl: company?.logoUrl }}
            size="sm"
          />
        </Link>
      </div>
    </header>
  );
}

export function PortalSidebarBrand() {
  const { company } = useEmployerWorkspace();

  return (
    <Link to="/portal/company" className={styles.brand}>
      <CompanyAvatar
        company={{ name: company?.name ?? 'Company', logoUrl: company?.logoUrl }}
        size="md"
      />
      <div className={styles.brandText}>
        <span className={styles.brandName}>{company?.name ?? 'Your company'}</span>
        <span className={styles.brandMeta}>Hiring workspace</span>
      </div>
    </Link>
  );
}

export function PortalBackToApp() {
  return (
    <Link to="/" className={styles.backLink}>
      <IconChevronLeft size={16} />
      Back to SwipeJobs
    </Link>
  );
}
