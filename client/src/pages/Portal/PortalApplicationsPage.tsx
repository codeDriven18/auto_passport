import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import { CandidateTrustBadge } from '@/components/portal/CandidateTrustBadge';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApplicationStatusLabels } from '@/models/enums';
import type { PortalApplication } from '@/models/portal';
import styles from './PortalPage.module.css';

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
      .catch(() => {
        setApplications([]);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [jobIdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTitle = useMemo(() => {
    if (!jobIdFilter) return 'Applications';
    const jobTitle = applications[0]?.jobTitle;
    return jobTitle ? `Applicants · ${jobTitle}` : 'Applications';
  }, [jobIdFilter, applications]);

  if (loading) return <p className={styles.status}>Loading applications…</p>;

  if (failed) {
    return (
      <section className={styles.page}>
        <EmptyState
          illustration="applications"
          title="Could not load applications"
          description="Check your connection and try again."
          actions={[{ label: 'Retry', onClick: load, primary: true }]}
        />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{filteredTitle}</h1>
        <p className={styles.subtitle}>{applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
        {jobIdFilter && (
          <Link to="/portal/applications" className={styles.btn}>View all applications</Link>
        )}
      </header>

      {applications.length === 0 ? (
        <EmptyState
          illustration="applications"
          title="No applications yet"
          description="Applications appear here when candidates apply to your jobs."
          actions={[{ label: 'Manage jobs', to: '/portal/jobs', primary: true }]}
        />
      ) : (
        <div className={styles.list}>
          {applications.map((app) => (
            <article key={app.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.applicantRow}>
                  <UserAvatar
                    profile={{
                      firstName: app.applicantName.split(' ')[0] ?? '',
                      lastName: app.applicantName.split(' ').slice(1).join(' ') ?? '',
                      email: app.applicantEmail,
                      profileImageUrl: app.applicantProfileImageUrl,
                    }}
                    size="md"
                  />
                  <div>
                    <h2 className={styles.cardTitle}>{app.applicantName || 'Applicant'}</h2>
                    <CandidateTrustBadge level={app.candidateTrustLevel} />
                    <p className={styles.cardMeta}>{app.applicantEmail}{app.applicantPhone ? ` · ${app.applicantPhone}` : ''}</p>
                  </div>
                </div>
                <span className={styles.badge}>{ApplicationStatusLabels[app.status]}</span>
              </div>
              <p className={styles.cardMeta}>
                Application #{app.applicationNumber} · Applied for <strong>{app.jobTitle}</strong> on {new Date(app.appliedAt).toLocaleDateString()}
              </p>
              <div className={styles.actions}>
                <Link to={`/portal/applications/${app.id}`} className={styles.btnAccent}>Review applicant</Link>
                <Link to={`/jobs/${app.jobId}`} className={styles.btn}>View job</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
