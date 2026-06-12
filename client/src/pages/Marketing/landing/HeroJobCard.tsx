import { motion } from 'framer-motion';
import styles from './HeroJobCard.module.css';

export function HeroJobCard() {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <motion.div
        className={styles.card}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className={styles.glow} aria-hidden />
        <header className={styles.header}>
          <span className={styles.logo}>N</span>
          <div>
            <p className={styles.company}>NovaTech</p>
            <p className={styles.meta}>Verified employer</p>
          </div>
          <span className={styles.match}>92%</span>
        </header>
        <h3 className={styles.title}>Senior Product Designer</h3>
        <p className={styles.salary}>$120,000 – $145,000</p>
        <p className={styles.location}>Remote · United States</p>
        <div className={styles.tags}>
          <span>Figma</span>
          <span>Design Systems</span>
          <span>Mobile</span>
        </div>
        <div className={styles.actions}>
          <span className={styles.pass}>Pass</span>
          <span className={styles.apply}>Apply</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
