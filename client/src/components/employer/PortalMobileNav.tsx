import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PORTAL_MOBILE_PRIMARY } from '@/components/employer/portalNav';
import styles from './PortalMobileNav.module.css';

interface PortalMobileNavProps {
  unreadMessages: number;
}

export function PortalMobileNav({ unreadMessages }: PortalMobileNavProps) {
  return (
    <nav className={styles.nav} aria-label="Employer mobile navigation">
      <div className={styles.inner}>
        {PORTAL_MOBILE_PRIMARY.map((item) => {
          const Icon = item.icon;
          const badge = item.badgeKey === 'messages' && unreadMessages > 0
            ? (unreadMessages > 9 ? '9+' : unreadMessages)
            : null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="employer-mobile-indicator"
                      className={styles.indicator}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className={styles.iconWrap}>
                    <Icon className={styles.icon} />
                    {badge && <span className={styles.badge}>{badge}</span>}
                  </span>
                  <span className={styles.label}>{item.shortLabel ?? item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
