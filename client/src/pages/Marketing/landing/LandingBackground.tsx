import styles from './LandingBackground.module.css';

export function LandingBackground() {
  return (
    <div className={styles.canvas} aria-hidden>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <div className={`${styles.orb} ${styles.orbC}`} />
      <div className={styles.noise} />
    </div>
  );
}
