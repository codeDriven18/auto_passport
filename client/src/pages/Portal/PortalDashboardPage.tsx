import { Link } from 'react-router-dom';
import ui from '@/components/employer/ui/employerUi.module.css';
import { useEmployerWorkspace } from '@/context/EmployerWorkspaceContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { buildEmployerAttentionItems } from '@/lib/employer/employerAttention';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompanyStatus, CompanyStatusLabels } from '@/models/operations';
import dashStyles from './PortalDashboardPage.module.css';

const QUICK_NAV = [
  { label: 'Pipeline', to: '/portal/pipeline' },
  { label: 'Candidates', to: '/portal/applications' },
  { label: 'Messages', to: '/portal/messages' },
  { label: 'Roles', to: '/portal/jobs' },
] as const;

export function PortalDashboardPage() {
  const { stats, loading, refreshStats } = useEmployerWorkspace();
  const { count: unreadMessages } = useUnreadMessages();

  if (loading && !stats) {
    return <p className={ui.statusText}>Loading workspace…</p>;
  }

  if (!stats) {
    return (
      <section className={ui.page}>
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
    <section className={ui.page}>
      {!isApproved && (
        <div className={stats.companyStatus === CompanyStatus.Rejected ? dashStyles.blockedBannerDanger : dashStyles.blockedBanner}>
          <strong>Blocked — {CompanyStatusLabels[stats.companyStatus]}</strong>
          {stats.companyStatus === CompanyStatus.Pending && ' You cannot publish roles until your company is approved.'}
          {stats.companyStatus === CompanyStatus.Rejected && ' Contact support if you believe this is an error.'}
          {stats.companyStatus === CompanyStatus.Suspended && ' Your company account is suspended.'}
        </div>
      )}

      <div className={ui.workboard}>
        <div className={ui.workboardToolbar}>
          <h1 className={ui.workboardToolbarTitle}>Needs your attention</h1>
          <span className={ui.workboardToolbarMeta}>{attentionItems.length} open</span>
        </div>
        <div className={ui.workboardWrap}>
          <table className={ui.workboardTable}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Details</th>
                <th>Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attentionItems.map((item, index) => (
                <tr key={item.id} className={index === 0 ? ui.workboardRowPrimary : undefined}>
                  <td className={ui.workboardCellTitle}>{item.title}</td>
                  <td className={ui.workboardCellSub}>{item.description}</td>
                  <td>{item.count ?? '—'}</td>
                  <td>
                    <Link to={item.to} className={index === 0 ? ui.btnPrimary : ui.btnGhost}>
                      {index === 0 ? 'Do now' : 'Open'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <nav className={ui.quickNav} aria-label="Quick navigation">
        {QUICK_NAV.map((item) => (
          <Link key={item.to} to={item.to} className={ui.quickNavLink}>{item.label}</Link>
        ))}
      </nav>

      <p className={dashStyles.contextLine}>
        {stats.activeJobs} active roles · {stats.newApplicationsThisWeek} new this week · {stats.totalApplications} total candidates
      </p>
    </section>
  );
}
