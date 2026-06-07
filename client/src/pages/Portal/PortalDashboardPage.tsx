import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import type { PortalStats } from '@/models/portal';
import { CompanyStatus, CompanyStatusLabels } from '@/models/operations';
import styles from './PortalPage.module.css';

export function PortalDashboardPage() {
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.status}>Loading portal stats...</p>;
  if (!stats) return <p className={styles.error}>Failed to load portal stats.</p>;

  const isApproved = stats.companyStatus === CompanyStatus.Approved;
  const cards = [
    { label: 'Total jobs', value: stats.totalJobs },
    { label: 'Active', value: stats.activeJobs },
    { label: 'Archived', value: stats.archivedJobs },
    { label: 'Applications', value: stats.totalApplications },
    { label: 'New this week', value: stats.newApplicationsThisWeek },
  ];

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Your hiring pipeline at a glance.</p>
      </header>

      {!isApproved && (
        <div className={`${styles.approvalBanner} ${stats.companyStatus === CompanyStatus.Rejected ? styles.approvalBannerRejected : ''}`}>
          <div className={styles.approvalBannerTitle}>
            Company status: {CompanyStatusLabels[stats.companyStatus]}
          </div>
          <p className={styles.approvalBannerText}>
            {stats.companyStatus === CompanyStatus.Pending && (
              'Your company is pending admin approval. You cannot publish jobs until approved.'
            )}
            {stats.companyStatus === CompanyStatus.Rejected && (
              'Your company registration was rejected. Contact support if you believe this is an error.'
            )}
            {stats.companyStatus === CompanyStatus.Suspended && (
              'Your company account is suspended. Job publishing is disabled.'
            )}
          </p>
        </div>
      )}

      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <span className={styles.statValue}>{card.value}</span>
            <span className={styles.statLabel}>{card.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Link to="/portal/jobs" className={styles.btnAccent}>Manage jobs</Link>
        <Link to="/portal/applications" className={styles.btn}>View applications</Link>
      </div>
    </section>
  );
}
