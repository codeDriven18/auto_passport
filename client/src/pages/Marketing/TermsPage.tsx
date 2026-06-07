import styles from './MarketingPage.module.css';

export function TermsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>Legal</span>
        <h1 className={styles.title}>Terms of Service</h1>
        <div className={styles.prose}>
          <p>Last updated: June 2026</p>
          <h2>Using SwipeJobs</h2>
          <p>
            By using SwipeJobs you agree to provide accurate information, respect other users, and
            comply with applicable laws. Job listings must be legitimate opportunities.
          </p>
          <h2>Accounts</h2>
          <p>
            You are responsible for safeguarding your credentials. Employers must represent authorized
            organizations when posting roles.
          </p>
          <h2>Liability</h2>
          <p>
            SwipeJobs facilitates connections between job seekers and employers but does not guarantee
            hiring outcomes. Use the platform at your own discretion.
          </p>
        </div>
      </section>
    </div>
  );
}
