import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getHomeRouteForRole } from '@/lib/authRoutes';
import { UserRole } from '@/models/auth';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role === UserRole.Admin || user?.role === UserRole.Company) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return children;
}
