import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getHomeRouteForRole } from '@/lib/authRoutes';
import { UserRole } from '@/models/auth';
import styles from './AdminGate.module.css';

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className={styles.loading}>Loading admin console...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== UserRole.Admin) {
    return <Navigate to={getHomeRouteForRole(user?.role ?? UserRole.JobSeeker)} replace />;
  }

  return children;
}
