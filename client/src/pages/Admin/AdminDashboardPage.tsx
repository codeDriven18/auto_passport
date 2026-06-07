import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/adminApi';
import { UserRoleLabels } from '@/models/auth';
import type { AdminAnalytics, AdminStats, AdminUser } from '@/models/admin';
import type { Company } from '@/models/company';
import type { Job } from '@/models/job';
import { CompanyStatus } from '@/models/operations';
import { AdminTrendChart, ANALYTICS_RANGES } from './AdminCharts';
import { jobStatusClass } from './adminUtils';
import styles from './AdminPage.module.css';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getStats(),
      adminApi.getAnalytics(days),
      adminApi.getJobs(),
      adminApi.getCompanies(),
      adminApi.getUsers(),
    ])
      .then(([s, a, j, c, u]) => {
        setStats(s);
        setAnalytics(a);
        setJobs(j);
        setCompanies(c);
        setUsers(u);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <p className={styles.status}>Loading dashboard...</p>;
  if (!stats || !analytics) return <p className={styles.error}>Failed to load dashboard.</p>;

  const recentJobs = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const pendingCompanies = companies.filter((c) => c.status === CompanyStatus.Pending).slice(0, 5);
  const latestUsers = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSubtitle}>Platform overview and management shortcuts.</p>
        </div>
        <div className={styles.filterGroup}>
          {ANALYTICS_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              className={`${styles.filterBtn} ${days === range.days ? styles.filterBtnActive : ''}`}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalUsers}</span>
          <span className={styles.metricLabel}>Users</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalCompanies}</span>
          <span className={styles.metricLabel}>Companies</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalJobs}</span>
          <span className={styles.metricLabel}>Jobs</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalApplications}</span>
          <span className={styles.metricLabel}>Applications</span>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <Link to="/admin/jobs" className={styles.quickLink}>Manage Jobs</Link>
        <Link to="/admin/companies" className={styles.quickLink}>Manage Companies</Link>
        <Link to="/admin/company-approvals" className={styles.quickLink}>Company Approvals</Link>
        <Link to="/admin/users" className={styles.quickLink}>Manage Users</Link>
        <Link to="/admin/reports" className={styles.quickLink}>Reports</Link>
        <Link to="/admin/audit" className={styles.quickLink}>Audit Logs</Link>
        <Link to="/admin/system" className={styles.quickLink}>Platform Health</Link>
        <Link to="/admin/notifications" className={styles.quickLink}>Notifications</Link>
      </div>

      <div className={styles.chartsGrid}>
        <AdminTrendChart title="Jobs per day" data={analytics.jobsPerDay} color="#6366f1" />
        <AdminTrendChart title="Applications per day" data={analytics.applicationsPerDay} color="#10b981" />
        <AdminTrendChart title="New users per day" data={analytics.usersPerDay} color="#f59e0b" />
        <AdminTrendChart title="New companies per day" data={analytics.companiesPerDay} color="#ec4899" />
      </div>

      <div className={styles.panelsGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Recent Jobs</div>
          <div className={styles.panelBody}>
            {recentJobs.length === 0 ? (
              <p className={styles.panelEmpty}>No jobs yet.</p>
            ) : (
              <ul className={styles.panelList}>
                {recentJobs.map((job) => (
                  <li key={job.id} className={styles.panelItem}>
                    <div className={styles.panelItemMain}>
                      <div className={styles.panelItemTitle}>{job.title}</div>
                      <div className={styles.panelItemMeta}>{job.company}</div>
                    </div>
                    <span className={jobStatusClass(job, styles)}>{job.isArchived ? 'Archived' : job.isActive ? 'Active' : 'Inactive'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            Pending Company Approvals
            <Link to="/admin/company-approvals" className={styles.btnGhost} style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
              View all
            </Link>
          </div>
          <div className={styles.panelBody}>
            {pendingCompanies.length === 0 ? (
              <p className={styles.panelEmpty}>No pending approvals.</p>
            ) : (
              <ul className={styles.panelList}>
                {pendingCompanies.map((company) => (
                  <li key={company.id} className={styles.panelItem}>
                    <div className={styles.panelItemMain}>
                      <div className={styles.panelItemTitle}>{company.name}</div>
                      <div className={styles.panelItemMeta}>{company.industry}</div>
                    </div>
                    <span className={styles.statusPending}>Pending</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Latest Registrations</div>
          <div className={styles.panelBody}>
            {latestUsers.length === 0 ? (
              <p className={styles.panelEmpty}>No users yet.</p>
            ) : (
              <ul className={styles.panelList}>
                {latestUsers.map((user) => (
                  <li key={user.id} className={styles.panelItem}>
                    <div className={styles.panelItemMain}>
                      <div className={styles.panelItemTitle}>{user.email}</div>
                      <div className={styles.panelItemMeta}>{UserRoleLabels[user.role]}</div>
                    </div>
                    <span className={styles.panelItemMeta}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
