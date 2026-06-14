import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@/components/icons/Icons';
import styles from './ProfileMenuItem.module.css';

interface ProfileMenuItemProps {
  to: string;
  icon: ReactNode;
  title: string;
  summary?: string;
}

export function ProfileMenuItem({ to, icon, title, summary }: ProfileMenuItemProps) {
  return (
    <Link to={to} className={styles.item}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
      </span>
      <IconChevronRight size={18} className={styles.chevron} aria-hidden />
    </Link>
  );
}

export function ProfileMenuList({ children }: { children: ReactNode }) {
  return <nav className={styles.list}>{children}</nav>;
}

export function ProfileMenuGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      {title && <p className={styles.groupTitle}>{title}</p>}
      {children}
    </div>
  );
}
