import { Link } from 'react-router-dom';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './AdminPage.module.css';

export function AdminSettingsPage() {
  const { mode, setMode } = useTheme();

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
          <h3>Appearance</h3>
          <p>Current theme: {mode}</p>
          <div className={styles.actions} style={{ marginTop: '0.75rem' }}>
            <button type="button" className={styles.btn} onClick={() => setMode('light')}>Light</button>
            <button type="button" className={styles.btn} onClick={() => setMode('dark')}>Dark</button>
          </div>
        </div>
        <div className={styles.reportCard}>
          <h3>Seeded admin account</h3>
          <p>In development, admin credentials come from <code>appsettings.Development.json</code>. In production, set <code>Admin__Email</code> and <code>Admin__Password</code> environment variables on Render.</p>
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
