import { Navigate, useLocation } from 'react-router-dom';
import { hasCompletedOnboarding } from '@/lib/onboardingStorage';

interface OnboardingGateProps {
  children: React.ReactNode;
}

const BYPASS_PREFIXES = [
  '/admin',
  '/portal',
  '/landing',
  '/features',
  '/about',
  '/faq',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
];

function shouldBypassOnboarding(pathname: string): boolean {
  return BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const location = useLocation();

  if (shouldBypassOnboarding(location.pathname)) {
    return children;
  }

  if (!hasCompletedOnboarding() && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  if (hasCompletedOnboarding() && location.pathname === '/welcome') {
    return <Navigate to="/swipe" replace />;
  }

  return children;
}
