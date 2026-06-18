import styles from './MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  accent?: boolean;
}

export function MetricCard({ label, value, trend, trendDirection = 'up', accent }: MetricCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${accent ? styles.accent : ''}`}>{value}</span>
      {trend && (
        <span className={`${styles.trend} ${trendDirection === 'down' ? styles.trendDown : ''}`}>
          {trend}
        </span>
      )}
    </article>
  );
}
