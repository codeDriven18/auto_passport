import { Link, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import styles from './MarketingLayout.module.css';

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
] as const;

export function MarketingLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/landing" className={styles.brand}>
          <span className={styles.logo} />
          <span className={styles.brandName}>SwipeJobs</span>
        </Link>
        <nav className={styles.nav} aria-label="Marketing navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          {isAuthenticated ? (
            <Link to="/" className={styles.btnPrimary}>Open app</Link>
          ) : (
            <>
              <Link to="/login" className={styles.btnGhost}>Sign in</Link>
              <Link to="/register" className={styles.btnPrimary}>Get started</Link>
            </>
          )}
        </div>
      </header>

      <motion.main
        className={styles.main}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.logo} />
          <p className={styles.footerTagline}>Swipe your way to your next role.</p>
        </div>
        <div className={styles.footerLinks}>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <p className={styles.copyright}>© {new Date().getFullYear()} SwipeJobs</p>
      </footer>
    </div>
  );
}
