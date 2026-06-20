import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEmployerWorkspace } from '@/context/EmployerWorkspaceContext';
import { useEmployerWorkspaceData } from '@/hooks/useEmployerWorkspaceData';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { buildEmployerAttentionItems } from '@/lib/employer/employerAttention';
import {
  countPipelineStages,
  getApplicantsNeedingReview,
  getInterviewQueue,
  getJobCampaignMetrics,
  getRecentApplicants,
} from '@/lib/employer/employerWorkspaceData';
import { ApplicantWorkRow, ConversationWorkRow, RoleWorkRow } from '@/portal/components/WorkQueueRow';
import { PageFrame } from '@/portal/components/PageFrame';
import ws from '@/portal/workspace.module.css';
import { CompanyStatus, CompanyStatusLabels } from '@/models/operations';

export function CommandCenterPage() {
  const { stats, loading: statsLoading, refreshStats } = useEmployerWorkspace();
  const { count: unreadMessages } = useUnreadMessages();
  const { applications, activeJobs, conversations, loading: dataLoading, failed, refresh } = useEmployerWorkspaceData();

  const loading = statsLoading || dataLoading;

  if (loading && !stats) {
    return <p className={ws.statusText}>Loading workspace…</p>;
  }

  if (!stats || failed) {
    return (
      <PageFrame>
        <EmptyState
          illustration="generic"
          title="Could not load workspace"
          description="Check your connection and try again."
          actions={[{ label: 'Retry', onClick: () => { void refreshStats(); void refresh(); }, primary: true }]}
        />
      </PageFrame>
    );
  }

  const isApproved = stats.companyStatus === CompanyStatus.Approved;
  const interviewQueue = getInterviewQueue(applications, 5);
  const reviewCount = getApplicantsNeedingReview(applications).length;
  const attentionItems = buildEmployerAttentionItems({
    stats,
    unreadMessages,
    upcomingInterviews: interviewQueue.length,
    candidatesWaitingReview: reviewCount,
  });
  const pipelineCounts = countPipelineStages(applications);
  const recentApplicants = getRecentApplicants(applications, 5);
  const unreadConversations = conversations.filter((c) => c.unreadCount > 0).slice(0, 5);
  const totalInPipeline = pipelineCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <PageFrame fill>
      {!isApproved && (
        <div className={ws.notice}>
          <strong>Blocked — {CompanyStatusLabels[stats.companyStatus]}</strong>
          {stats.companyStatus === CompanyStatus.Pending && ' Publishing and some hiring actions are paused until approval.'}
        </div>
      )}

      <header className={ws.homeHeader}>
        <div>
          <p className={ws.homeEyebrow}>Recruiting workspace</p>
          <h2 className={ws.homeTitle}>
            {attentionItems[0]?.priority === 'high'
              ? attentionItems[0].title
              : 'Your pipeline is up to date'}
          </h2>
          <p className={ws.homeMeta}>
            {reviewCount > 0 && `${reviewCount} awaiting review · `}
            {unreadMessages > 0 && `${unreadMessages} unread · `}
            {interviewQueue.length > 0 && `${interviewQueue.length} interviews · `}
            {stats.activeJobs} open roles
          </p>
        </div>
        <div className={ws.pageActions}>
          <Link to="/portal/pipeline" className={ws.btnPrimary}>Open pipeline</Link>
          <Link to="/portal/jobs" className={ws.btnGhost}>Post role</Link>
        </div>
      </header>

      <section className={ws.attentionStrip} aria-label="Requires attention">
        {attentionItems.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={[ws.attentionRow, item.priority === 'high' ? ws.attentionRowUrgent : ''].filter(Boolean).join(' ')}
          >
            <div className={ws.attentionRowBody}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
            {item.count != null && <span className={ws.attentionCount}>{item.count}</span>}
          </Link>
        ))}
      </section>

      <div className={ws.homeGrid}>
        <div className={ws.homeMain}>
          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Recent applicants</h3>
              <Link to="/portal/applications" className={ws.workSectionLink}>View all</Link>
            </div>
            {recentApplicants.length === 0 ? (
              <div className={ws.workEmpty}>
                <p>No applicants yet.</p>
                <Link to="/portal/jobs" className={ws.btnPrimary}>Publish a role</Link>
              </div>
            ) : (
              recentApplicants.map((app) => <ApplicantWorkRow key={app.id} application={app} />)
            )}
          </section>

          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Pipeline snapshot</h3>
              <Link to="/portal/pipeline" className={ws.workSectionLink}>Open board</Link>
            </div>
            <div className={ws.pipelineSnapshot}>
              {pipelineCounts.map((stage) => (
                <Link key={stage.stage} to="/portal/pipeline" className={ws.snapshotStage}>
                  <strong>{stage.count}</strong>
                  <span>{stage.label}</span>
                </Link>
              ))}
            </div>
            <p className={ws.snapshotMeta}>{totalInPipeline} candidates across {pipelineCounts.length} stages</p>
          </section>

          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Upcoming interviews</h3>
              <Link to="/portal/pipeline" className={ws.workSectionLink}>Pipeline</Link>
            </div>
            {interviewQueue.length === 0 ? (
              <div className={ws.workEmpty}>
                <p>No interviews in progress. Invite candidates from the pipeline.</p>
                <Link to="/portal/pipeline" className={ws.btnGhost}>Review pipeline</Link>
              </div>
            ) : (
              interviewQueue.map((app) => <ApplicantWorkRow key={app.id} application={app} />)
            )}
          </section>
        </div>

        <aside className={ws.homeAside}>
          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Unread messages</h3>
              <Link to="/portal/messages" className={ws.workSectionLink}>Inbox</Link>
            </div>
            {unreadConversations.length === 0 ? (
              <p className={ws.workEmptyInline}>Inbox clear — no unread threads.</p>
            ) : (
              unreadConversations.map((c) => <ConversationWorkRow key={c.id} conversation={c} />)
            )}
          </section>

          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Open roles</h3>
              <Link to="/portal/jobs" className={ws.workSectionLink}>Manage</Link>
            </div>
            {activeJobs.length === 0 ? (
              <div className={ws.workEmpty}>
                <p>No active roles.</p>
                <Link to="/portal/jobs" className={ws.btnPrimary}>Post role</Link>
              </div>
            ) : (
              activeJobs.slice(0, 4).map((job) => (
                <RoleWorkRow
                  key={job.id}
                  job={job}
                  applicantCount={getJobCampaignMetrics(job.id, applications).applicants}
                />
              ))
            )}
          </section>

          <section className={ws.workSection}>
            <div className={ws.workSectionHeader}>
              <h3 className={ws.workSectionTitle}>Hiring activity</h3>
            </div>
            <dl className={ws.activityStats}>
              <div><dt>Total candidates</dt><dd>{stats.totalApplications}</dd></div>
              <div><dt>New this week</dt><dd>{stats.newApplicationsThisWeek}</dd></div>
              <div><dt>Active roles</dt><dd>{stats.activeJobs}</dd></div>
              <div><dt>In pipeline</dt><dd>{totalInPipeline}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </PageFrame>
  );
}
