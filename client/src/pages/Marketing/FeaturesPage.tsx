import { Link } from 'react-router-dom';
import styles from './MarketingPage.module.css';

const features = [
  {
    title: 'Swipe mode',
    text: 'Discover jobs one card at a time. Save the ones you love, skip the rest.',
  },
  {
    title: 'Personal dashboard',
    text: 'Track profile completion, saved jobs, applications, and trending picks.',
  },
  {
    title: 'Company profiles',
    text: 'Follow employers and get notified when they post new roles.',
  },
  {
    title: 'Real-time alerts',
    text: 'Push-style notifications when new matches and updates arrive.',
  },
  {
    title: 'Employer portal',
    text: 'Companies manage listings, review applicants, and track hiring stats.',
  },
  {
    title: 'PWA ready',
    text: 'Install SwipeJobs on your home screen for an app-like experience.',
  },
];

export function FeaturesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>Features</span>
        <h1 className={styles.title}>Everything you need to hire and get hired.</h1>
        <p className={styles.lead}>
          SwipeJobs combines discovery, applications, and employer tools in one polished experience.
        </p>
      </section>

      <div className={styles.grid2}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{feature.title}</h2>
            <p className={styles.cardText}>{feature.text}</p>
          </article>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Link to="/register" className={styles.btnPrimary}>Create account</Link>
        <Link to="/landing" className={styles.btnSecondary}>Back to home</Link>
      </div>
    </div>
  );
}
