import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { AdminAnalytics, AdminStats } from '@/models/admin';
import { AdminTopList, AdminTrendChart, ANALYTICS_RANGES } from './AdminCharts';
import styles from './AdminPage.module.css';

export function AdminReportsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.getStats(), adminApi.getAnalytics(days)])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .catch(() => {
        setStats(null);
        setAnalytics(null);
      })
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <p className={styles.status}>Loading reports...</p>;
  if (!stats || !analytics) return <p className={styles.error}>Failed to load reports.</p>;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports & Analytics</h1>
          <p className={styles.pageSubtitle}>Growth trends and platform activity.</p>
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
          <span className={styles.metricValue}>{stats.activeJobs}</span>
          <span className={styles.metricLabel}>Active jobs</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalUsers}</span>
          <span className={styles.metricLabel}>Users</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalApplications}</span>
          <span className={styles.metricLabel}>Applications</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{stats.totalCompanies}</span>
          <span className={styles.metricLabel}>Companies</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <AdminTrendChart title="Jobs per day" data={analytics.jobsPerDay} color="#6366f1" />
        <AdminTrendChart title="Applications per day" data={analytics.applicationsPerDay} color="#10b981" />
        <AdminTrendChart title="New users per day" data={analytics.usersPerDay} color="#f59e0b" />
        <AdminTrendChart title="New companies per day" data={analytics.companiesPerDay} color="#ec4899" />
      </div>

      <div className={styles.chartsGrid}>
        <AdminTopList title="Top companies" items={analytics.topCompanies} />
        <AdminTopList title="Top cities" items={analytics.topCities} />
        <AdminTopList title="Top tags" items={analytics.topTags} />
      </div>
    </section>
  );
}
