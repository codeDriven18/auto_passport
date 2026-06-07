import styles from './MarketingPage.module.css';

const faqs = [
  {
    q: 'Is SwipeJobs free for job seekers?',
    a: 'Yes. Creating an account, swiping jobs, saving listings, and applying is free.',
  },
  {
    q: 'How does swipe mode work?',
    a: 'Swipe mode shows one job at a time. Swipe right to save, left to skip, or tap for details.',
  },
  {
    q: 'Can companies post jobs?',
    a: 'Yes. Register as an employer to access the company portal with job management and applicant review.',
  },
  {
    q: 'Do you support dark mode?',
    a: 'Absolutely. Toggle appearance in Settings or match your system preference.',
  },
  {
    q: 'Can I install SwipeJobs on my phone?',
    a: 'Yes. SwipeJobs is a Progressive Web App — add it to your home screen for offline shell support.',
  },
];

export function FaqPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>FAQ</span>
        <h1 className={styles.title}>Questions? We have answers.</h1>
        <p className={styles.lead}>Quick answers to common questions about SwipeJobs.</p>
      </section>

      <div className={styles.faqList}>
        {faqs.map((faq) => (
          <article key={faq.q} className={styles.faqItem}>
            <h2 className={styles.faqQuestion}>{faq.q}</h2>
            <p className={styles.faqAnswer}>{faq.a}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
