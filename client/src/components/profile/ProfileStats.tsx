import { Link } from 'react-router-dom';
import { IconCheck } from '@/components/icons/Icons';
import styles from './ProfileStats.module.css';

interface ProfileStatsProps {
  applicationsCount: number;
  savedCount: number;
  resumeReady: boolean;
}

export function ProfileStats({ applicationsCount, savedCount, resumeReady }: ProfileStatsProps) {
  return (
    <div className={styles.row}>
      <Link to="/applications" className={styles.card}>
        <span className={styles.value}>{applicationsCount}</span>
        <span className={styles.label}>Applications</span>
      </Link>
      <Link to="/saved" className={styles.card}>
        <span className={styles.value}>{savedCount}</span>
        <span className={styles.label}>Saved</span>
      </Link>
      <Link to="/profile/resume" className={styles.card}>
        <span className={`${styles.value} ${resumeReady ? styles.ready : styles.muted}`}>
          {resumeReady ? <IconCheck size={18} /> : '—'}
        </span>
        <span className={styles.label}>Resume</span>
      </Link>
    </div>
  );
}
