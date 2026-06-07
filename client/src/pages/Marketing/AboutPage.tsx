import styles from './MarketingPage.module.css';

export function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>About</span>
        <h1 className={styles.title}>We make job search feel human again.</h1>
        <div className={styles.prose}>
          <p>
            SwipeJobs was built for a generation that expects speed, clarity, and mobile-first design.
            Traditional job boards bury great opportunities under endless filters and stale listings.
          </p>
          <p>
            We flipped the script: swipe through curated roles, build a rich profile once, and apply
            with confidence. Employers get a dedicated portal to post jobs and review applicants without
            the enterprise bloat.
          </p>
          <h2>Our mission</h2>
          <p>
            Connect talented people with great companies — faster, fairer, and with a smile.
          </p>
        </div>
      </section>
    </div>
  );
}
