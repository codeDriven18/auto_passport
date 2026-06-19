import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import { UserAvatar } from '@/components/profile/UserAvatar';
import ui from '@/components/employer/ui/employerUi.module.css';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApplicationStatusLabels } from '@/models/enums';
import type { PortalApplication } from '@/models/portal';

export function PortalApplicationsPage() {
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId') ?? undefined;
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setFailed(false);
    portalApi.getApplications(jobIdFilter)
      .then(setApplications)
      .catch(() => { setApplications([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, [jobIdFilter]);

  useEffect(() => { load(); }, [load]);

  const pageTitle = useMemo(() => {
    if (!jobIdFilter) return 'Candidates';
    return applications[0]?.jobTitle ?? 'Candidates';
  }, [jobIdFilter, applications]);

  if (loading) return <p className={ui.statusText}>Loading candidates…</p>;

  if (failed) {
    return (
      <section className={ui.page}>
        <EmptyState illustration="applications" title="Could not load candidates" description="Check your connection." actions={[{ label: 'Retry', onClick: load, primary: true }]} />
      </section>
    );
  }

  return (
    <section className={ui.page}>
      <div className={ui.workboard}>
        <div className={ui.workboardToolbar}>
          <div>
            <h1 className={ui.workboardToolbarTitle}>{pageTitle}</h1>
            {jobIdFilter && (
              <p className={ui.workboardToolbarMeta}>
                <Link to="/portal/applications">View all candidates</Link>
              </p>
            )}
          </div>
          <span className={ui.workboardToolbarMeta}>{applications.length} total</span>
        </div>

        {applications.length === 0 ? (
          <EmptyState illustration="applications" title="No candidates yet" description="Applications appear when candidates apply to your roles." actions={[{ label: 'View pipeline', to: '/portal/pipeline', primary: true }]} />
        ) : (
          <div className={ui.workboardWrap}>
            <table className={ui.workboardTable}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const parts = app.applicantName.trim().split(/\s+/);
                  const applied = new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <tr key={app.id}>
                      <td>
                        <div className={ui.workboardCellName}>
                          <UserAvatar profile={{ firstName: parts[0] ?? '', lastName: parts.slice(1).join(' '), email: app.applicantEmail, profileImageUrl: app.applicantProfileImageUrl }} size="md" />
                          <div className={ui.workboardCellStack}>
                            <span className={ui.workboardCellTitle}>{app.applicantName || 'Candidate'}</span>
                            <span className={ui.workboardCellSub}>{app.applicantEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td>{app.jobTitle}</td>
                      <td><span className={ui.badge}>{ApplicationStatusLabels[app.status]}</span></td>
                      <td>{applied}{app.unreadMessageCount > 0 ? ` · ${app.unreadMessageCount} unread` : ''}</td>
                      <td>
                        <div className={ui.workboardActions}>
                          <Link to={`/portal/applications/${app.id}`} className={ui.btnPrimary}>Profile</Link>
                          <Link to="/portal/pipeline" className={ui.btnGhost}>Pipeline</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
