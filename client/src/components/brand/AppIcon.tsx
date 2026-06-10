import styles from './AppIcon.module.css';

interface AppIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showShadow?: boolean;
}

const SIZE_MAP = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

export function AppIcon({ size = 'md', className = '', showShadow = true }: AppIconProps) {
  return (
    <span
      className={`${styles.icon} ${SIZE_MAP[size]} ${showShadow ? styles.shadow : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
        <rect width="192" height="192" rx="40" fill="#FFD600" />
        <path d="M48 96c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48" stroke="#0A0A0A" strokeWidth="12" strokeLinecap="round" />
        <path d="M96 48v48l34 20" stroke="#0A0A0A" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="96" cy="96" r="10" fill="#0A0A0A" />
      </svg>
    </span>
  );
}
