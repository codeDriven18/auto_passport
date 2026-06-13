import { CandidateTrustLevel, CandidateTrustLevelLabels } from '@/models/enums';
import styles from './CandidateTrustBadge.module.css';

interface CandidateTrustBadgeProps {
  level: CandidateTrustLevel;
  signals?: number;
  className?: string;
}

export function CandidateTrustBadge({ level, signals, className = '' }: CandidateTrustBadgeProps) {
  if (level === CandidateTrustLevel.None) return null;

  return (
    <span className={`${styles.badge} ${styles[`level${level}`]} ${className}`}>
      {CandidateTrustLevelLabels[level]}
      {signals !== undefined && signals > 0 && (
        <span className={styles.signals}>{signals}/6 signals</span>
      )}
    </span>
  );
}
