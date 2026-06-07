import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { JobApplication } from '@/models/application';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from './AdminPage.module.css';

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getApplications()
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.status}>Loading applications...</p>;

  return (
    <section className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>Applications</span>
          <span className={styles.pageSubtitle}>{applications.length} total</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.job?.title ?? '—'}</td>
                  <td>{app.job?.company ?? '—'}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
