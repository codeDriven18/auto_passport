import styles from './TrendingBadge.module.css';

interface TrendingBadgeProps {
  label: string;
}

export function TrendingBadge({ label }: TrendingBadgeProps) {
  const variant = label.toLowerCase().includes('viewed')
    ? styles.viewed
    : label.toLowerCase().includes('saved')
      ? styles.saved
      : styles.applied;

  return <span className={`${styles.badge} ${variant}`}>{label}</span>;
}

export function TrendingBadges({ badges }: { badges?: string[] }) {
  if (!badges?.length) return null;
  return (
    <div className={styles.row}>
      {badges.map((b) => <TrendingBadge key={b} label={b} />)}
    </div>
  );
}
