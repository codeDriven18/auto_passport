import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/auth';

interface PortalGateProps {
  children: React.ReactNode;
}

export function PortalGate({ children }: PortalGateProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== UserRole.Company && user?.role !== UserRole.Admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
