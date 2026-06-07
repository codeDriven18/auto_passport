import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/auth';
import styles from './Navigation.module.css';

const guestItems = [
  { to: '/', label: 'Home', icon: '▣' },
  { to: '/jobs', label: 'Jobs', icon: '☰' },
  { to: '/swipe', label: 'Swipe', icon: '⚡', featured: true },
  { to: '/login', label: 'Sign in', icon: '→' },
] as const;

const authBaseItems = [
  { to: '/', label: 'Home', icon: '▣' },
  { to: '/jobs', label: 'Jobs', icon: '☰' },
  { to: '/swipe', label: 'Swipe', icon: '⚡', featured: true },
  { to: '/saved', label: 'Saved', icon: '♡' },
  { to: '/profile', label: 'Profile', icon: '◎' },
] as const;

export function Navigation() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  const roleItems = [];
  if (isAuthenticated && user?.role === UserRole.Company) {
    roleItems.push({ to: '/portal', label: 'Portal', icon: '🏢' });
  }

  const navItems = isAuthenticated ? [...authBaseItems, ...roleItems] : guestItems;

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => {
            const classes = [styles.link];
            if (isActive) classes.push(styles.active);
            if ('featured' in item && item.featured) classes.push(styles.featured);
            return classes.join(' ');
          }}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
