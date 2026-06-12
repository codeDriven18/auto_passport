import { Link } from 'react-router-dom';
import { ThemeAppearancePicker } from '@/components/theme/ThemeAppearancePicker';
import styles from './AdminPage.module.css';

export function AdminSettingsPage() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>System Settings</h1>
          <p className={styles.pageSubtitle}>Console preferences and platform links.</p>
        </div>
      </header>

      <div className={styles.reportGrid}>
        <div className={styles.reportCard}>
          <ThemeAppearancePicker />
        </div>
        <div className={styles.reportCard}>
          <h3>Seeded admin account</h3>
          <p>In development, admin credentials come from <code>appsettings.Development.json</code>. In production, set <code>Admin__Email</code> and <code>Admin__Password</code> environment variables on Azure App Service.</p>
        </div>
        <div className={styles.reportCard}>
          <h3>Public app</h3>
          <p>Return to the job seeker experience without signing out.</p>
          <Link to="/" className={styles.btnPrimary} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
            Open SwipeJobs app
          </Link>
        </div>
        <div className={styles.reportCard}>
          <h3>Marketing site</h3>
          <p>Preview the public landing and content pages.</p>
          <Link to="/landing" className={styles.btn} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
            View landing page
          </Link>
        </div>
      </div>
    </section>
  );
}
