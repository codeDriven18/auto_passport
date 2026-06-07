import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyCount } from '@/models/admin';
import styles from './AdminPage.module.css';

interface AdminTrendChartProps {
  title: string;
  data: DailyCount[];
  color?: string;
}

export function AdminTrendChart({ title, data, color = '#6366f1' }: AdminTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>{title}</div>
      <div className={styles.chartBody}>
        {chartData.length === 0 ? (
          <p className={styles.panelEmpty}>No data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                fill={`url(#grad-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

interface AdminTopListProps {
  title: string;
  items: { name: string; count: number }[];
}

export function AdminTopList({ title, items }: AdminTopListProps) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>{title}</div>
      <div className={styles.chartBody}>
        {items.length === 0 ? (
          <p className={styles.panelEmpty}>No data yet.</p>
        ) : (
          <ul className={styles.topList}>
            {items.map((item) => (
              <li key={item.name} className={styles.topListItem}>
                <span>{item.name}</span>
                <span className={styles.topListCount}>{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const ANALYTICS_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
] as const;
