import styles from './MarketingPage.module.css';

export function PrivacyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>Legal</span>
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.prose}>
          <p>Last updated: June 2026</p>
          <h2>What we collect</h2>
          <p>
            We collect account information (email, profile details), job activity (views, saves,
            applications), and device data needed to deliver notifications and improve the service.
          </p>
          <h2>How we use data</h2>
          <p>
            Your data powers personalized recommendations, application workflows, and employer
            matching. We do not sell your personal information to third parties.
          </p>
          <h2>Your choices</h2>
          <p>
            You can update your profile, manage notification preferences, and request account deletion
            by contacting support.
          </p>
        </div>
      </section>
    </div>
  );
}
