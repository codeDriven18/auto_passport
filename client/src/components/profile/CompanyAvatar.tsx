import type { Company } from '@/models/company';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './CompanyAvatar.module.css';

interface CompanyAvatarProps {
  company: Pick<Company, 'name' | 'logoUrl'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  circular?: boolean;
}

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';
}

export function CompanyAvatar({ company, size = 'md', className = '', circular = false }: CompanyAvatarProps) {
  const initials = getInitials(company.name);
  const logoSrc = resolveMediaUrl(company.logoUrl);
  const classes = [
    styles.avatar,
    sizeClass[size],
    circular ? styles.circular : '',
    className,
  ].filter(Boolean).join(' ');

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={`${company.name} logo`}
        className={classes}
      />
    );
  }

  return (
    <span
      className={`${classes} ${styles.fallback}`.trim()}
      aria-label={`${company.name} logo`}
      role="img"
    >
      {initials}
    </span>
  );
}
