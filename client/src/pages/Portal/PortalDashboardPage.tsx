import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/employer/MetricCard';
import { EmployerPageHeader } from '@/components/employer/EmployerPageHeader';
import { useEmployerWorkspace } from '@/context/EmployerWorkspaceContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { buildEmployerAttentionItems } from '@/lib/employer/employerAttention';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompanyStatus, CompanyStatusLabels } from '@/models/operations';
import styles from './PortalWorkspacePage.module.css';

export function PortalDashboardPage() {
  const { stats, loading, refreshStats } = useEmployerWorkspace();
  const { count: unreadMessages } = useUnreadMessages();

  if (loading && !stats) {
    return <p className={styles.loading}>Loading workspace…</p>;
  }

  if (!stats) {
    return (
      <section className={styles.page}>
        <EmptyState
          illustration="generic"
          title="Could not load workspace"
          description="Check your connection and try again."
          actions={[{ label: 'Retry', onClick: () => void refreshStats(), primary: true }]}
        />
      </section>
    );
  }

  const isApproved = stats.companyStatus === CompanyStatus.Approved;
  const attentionItems = buildEmployerAttentionItems({ stats, unreadMessages });

  return (
    <section className={styles.page}>
      <EmployerPageHeader
        title="Good morning"
        subtitle="What needs your attention right now."
        actions={(
          <Link to="/portal/pipeline" className={styles.primaryBtn}>
            Open pipeline
          </Link>
        )}
      />

      {!isApproved && (
        <div className={`${styles.banner} ${stats.companyStatus === CompanyStatus.Rejected ? styles.bannerDanger : ''}`}>
          <strong>Company status: {CompanyStatusLabels[stats.companyStatus]}</strong>
          <p>
            {stats.companyStatus === CompanyStatus.Pending && 'Publishing is paused until your company is approved.'}
            {stats.companyStatus === CompanyStatus.Rejected && 'Contact support if you believe this is an error.'}
            {stats.companyStatus === CompanyStatus.Suspended && 'Your company account is suspended.'}
          </p>
        </div>
      )}

      <section className={styles.attention} aria-labelledby="attention-heading">
        <h2 id="attention-heading" className={styles.sectionTitle}>Requires attention</h2>
        <div className={styles.attentionGrid}>
          {attentionItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={[
                styles.attentionCard,
                item.priority === 'high' ? styles.attentionCardHigh : '',
              ].filter(Boolean).join(' ')}
            >
              <span className={styles.attentionLabel}>{item.title}</span>
              <span className={styles.attentionValue}>{item.description}</span>
              {item.count != null && item.count > 0 && (
                <span className={styles.attentionCount}>{item.count}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.statsTitle}>At a glance</h2>
        <div className={styles.metricsGrid}>
          <MetricCard label="Active jobs" value={stats.activeJobs} accent />
          <MetricCard label="New applications" value={stats.newApplicationsThisWeek} trend="This week" />
          <MetricCard label="Total applications" value={stats.totalApplications} />
          <MetricCard label="Unread messages" value={unreadMessages} />
        </div>
      </section>
    </section>
  );
}
