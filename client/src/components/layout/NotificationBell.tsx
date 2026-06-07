import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.bell}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className={styles.count}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button type="button" className={styles.backdrop} onClick={() => setOpen(false)} aria-label="Close" />
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <button type="button" className={styles.markAll} onClick={() => void markAllRead()}>
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className={styles.empty}>No notifications yet.</p>
              ) : (
                <ul className={styles.list}>
                  {notifications.map((n) => (
                    <li key={n.id} className={n.isRead ? styles.itemRead : styles.item}>
                      <div className={styles.itemTop}>
                        <strong>{n.title}</strong>
                        {!n.isRead && (
                          <button type="button" className={styles.readBtn} onClick={() => void markRead(n.id)}>
                            ✓
                          </button>
                        )}
                      </div>
                      <p className={styles.msg}>{n.message}</p>
                      {n.relatedJobId && (
                        <Link to={`/jobs/${n.relatedJobId}`} className={styles.link} onClick={() => setOpen(false)}>
                          View job →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
