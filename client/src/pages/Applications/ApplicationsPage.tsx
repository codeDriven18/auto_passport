import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '@/api/applicationsApi';
import { useAuth } from '@/context/AuthContext';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobCardSkeletonList } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import type { JobApplication } from '@/models/application';
import styles from './ApplicationsPage.module.css';

export function ApplicationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    if (authLoading || !isAuthenticated) return;
    setLoading(true);
    setFailed(false);
    applicationsApi.getMine()
      .then(setApplications)
      .catch(() => {
        setApplications([]);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }
    load();
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <section className={styles.page}>
        <PageHeader title="Applications" subtitle="Track your Quick Apply submissions." />
        <JobCardSkeletonList count={2} />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className={styles.page}>
        <PageHeader title="Applications" subtitle="Track your Quick Apply submissions." />
        <EmptyState
          illustration="applications"
          title="Your next opportunity starts here"
          description="Create an account to Quick Apply and track every submission."
          actions={[
            { label: 'Sign in', to: '/login', primary: true },
            { label: 'Start swiping', to: '/swipe' },
          ]}
        />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <PageHeader title="Applications" subtitle={`${applications.length} submission${applications.length !== 1 ? 's' : ''}`} />
      {failed ? (
        <EmptyState
          illustration="applications"
          title="Could not load applications"
          description="Check your connection and try again."
          actions={[{ label: 'Retry', onClick: load, primary: true }]}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          illustration="applications"
          title="Your next opportunity starts here"
          description="Swipe up to apply instantly, or tap Quick Apply on any role you love."
          actions={[
            { label: 'Start swiping', to: '/swipe', primary: true },
            { label: 'Browse Discover', to: '/jobs' },
          ]}
        />
      ) : (
        <div className={styles.list}>
          {applications.map((app, index) => (
            <ApplicationCard
              key={app.id}
              application={app}
              index={index}
              onClick={() => navigate(`/jobs/${app.jobId}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
