import { usePwaInstallPrompt } from '@/context/PwaInstallContext';
import styles from './PwaInstall.module.css';
import { InstallAppButton } from './InstallAppButton';

export function AppInstallationSection() {
  const { canInstall, isInstalled, isIos, fallbackMessage, installStatus } = usePwaInstallPrompt();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>App Installation</h2>
          <p className={styles.cardDesc}>
            Install SwipeJobs as an app for faster access and a fullscreen experience.
          </p>
        </div>
        <span className={`${styles.status} ${isInstalled ? styles.statusInstalled : styles.statusNotInstalled}`}>
          {installStatus}
        </span>
      </div>

      {canInstall ? (
        <div className={styles.actions}>
          <InstallAppButton variant="full" showFallback={false} />
        </div>
      ) : isInstalled ? null : (
        <div className={styles.fallbackCard}>{isIos ? fallbackMessage : fallbackMessage}</div>
      )}
    </div>
  );
}
