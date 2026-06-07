import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import styles from './PortalLayout.module.css';

const navItems = [
  { to: '/portal', label: 'Dashboard', end: true },
  { to: '/portal/jobs', label: 'Jobs' },
  { to: '/portal/applications', label: 'Applications' },
] as const;

export function PortalLayout() {
  const { user } = useAuth();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} />
          <div>
            <span className={styles.brandTitle}>Company Portal</span>
            <span className={styles.brandSub}>{user?.companyName ?? 'Your company'}</span>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Portal navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className={styles.backLink}>← Back to app</NavLink>
      </aside>
      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
