import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './Navigation';
import { NotificationBell } from './NotificationBell';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';
import { AppIcon } from '@/components/brand/AppIcon';
import { useAuth } from '@/context/AuthContext';
import { usePwaInstallPrompt } from '@/context/PwaInstallContext';
import styles from './AppLayout.module.css';

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password']);

export function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isStandalone } = usePwaInstallPrompt();
  const isSwipe = location.pathname === '/swipe';
  const isWelcome = location.pathname === '/welcome';
  const isAuthPage = AUTH_PATHS.has(location.pathname);
  const hideHeader = isSwipe || isWelcome || isAuthPage;
  const hideNav = isAuthPage;

  return (
    <div className={styles.layout}>
      {!hideHeader && (
        <header className={styles.header}>
          <div className={styles.brand}>
            <AppIcon size="sm" />
            <span className={styles.title}>SwipeJobs</span>
          </div>
          <div className={styles.headerActions}>
            {!isStandalone && (
              <InstallAppButton variant="compact" showFallback={false} className={styles.installBtn} />
            )}
            {isAuthenticated && <NotificationBell />}
          </div>
        </header>
      )}

      <main className={`${styles.main} ${isSwipe ? styles.mainSwipe : ''} ${isWelcome ? styles.mainWelcome : ''} ${isAuthPage ? styles.mainWelcome : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={styles.pageContent}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNav && <Navigation />}
    </div>
  );
}
