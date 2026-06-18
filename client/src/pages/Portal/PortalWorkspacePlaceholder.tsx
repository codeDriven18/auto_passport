import { Link } from 'react-router-dom';
import { EmployerPageHeader } from '@/components/employer/EmployerPageHeader';
import styles from './PortalWorkspacePage.module.css';

interface PortalWorkspacePlaceholderProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export function PortalWorkspacePlaceholder({
  title,
  subtitle,
  ctaLabel,
  ctaTo,
}: PortalWorkspacePlaceholderProps) {
  return (
    <section className={styles.page}>
      <EmployerPageHeader title={title} subtitle={subtitle} />
      <div className={styles.placeholder}>
        <p className={styles.placeholderText}>
          This section is part of the employer redesign and will ship in the next phase.
        </p>
        {ctaLabel && ctaTo && (
          <Link to={ctaTo} className={styles.cta}>{ctaLabel}</Link>
        )}
      </div>
    </section>
  );
}
