import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '▣', end: true },
  { to: '/admin/jobs', label: 'Jobs', icon: '☰' },
  { to: '/admin/companies', label: 'Companies', icon: '🏢' },
  { to: '/admin/company-approvals', label: 'Approvals', icon: '✓' },
  { to: '/admin/users', label: 'Users', icon: '◎' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { to: '/admin/audit', label: 'Audit Logs', icon: '📝' },
  { to: '/admin/system', label: 'System', icon: '◉' },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙' },
] as const;

const pageTitles: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/jobs': 'Job Management',
  '/admin/companies': 'Company Management',
  '/admin/company-approvals': 'Company Approvals',
  '/admin/users': 'User Management',
  '/admin/applications': 'Applications',
  '/admin/reports': 'Reports & Analytics',
  '/admin/audit': 'Audit Logs',
  '/admin/system': 'Platform Health',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'System Settings',
};

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Admin';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} />
          <div>
            <span className={styles.brandTitle}>SwipeJobs</span>
            <span className={styles.brandSub}>Admin Console</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink to="/" className={styles.footerLink}>← Back to app</NavLink>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <span className={styles.topbarTitle}>{pageTitle}</span>
          <div className={styles.topbarRight}>
            <span>{user?.email}</span>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
