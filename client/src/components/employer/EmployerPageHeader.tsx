import type { ReactNode } from 'react';
import styles from './EmployerPageHeader.module.css';

interface EmployerPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function EmployerPageHeader({ title, subtitle, actions }: EmployerPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
