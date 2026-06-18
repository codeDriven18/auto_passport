import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { portalApi } from '@/api/portalApi';
import type { Company } from '@/models/company';
import type { PortalStats } from '@/models/portal';

interface EmployerWorkspaceState {
  company: Company | null;
  stats: PortalStats | null;
  loading: boolean;
  brandColor: string;
  refreshCompany: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const EmployerWorkspaceContext = createContext<EmployerWorkspaceState | null>(null);

function hashBrandColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 68% 52%)`;
}

export function EmployerWorkspaceProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    try {
      const next = await portalApi.getCompany();
      setCompany(next);
    } catch {
      setCompany(null);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const next = await portalApi.getStats();
      setStats(next);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([portalApi.getCompany(), portalApi.getStats()])
      .then(([companyData, statsData]) => {
        if (!active) return;
        setCompany(companyData);
        setStats(statsData);
      })
      .catch(() => {
        if (!active) return;
        setCompany(null);
        setStats(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const brandColor = useMemo(
    () => hashBrandColor(company?.name ?? 'SwipeJobs'),
    [company?.name],
  );

  const value = useMemo(
    () => ({
      company,
      stats,
      loading,
      brandColor,
      refreshCompany,
      refreshStats,
    }),
    [company, stats, loading, brandColor, refreshCompany, refreshStats],
  );

  return (
    <EmployerWorkspaceContext.Provider value={value}>
      {children}
    </EmployerWorkspaceContext.Provider>
  );
}

export function useEmployerWorkspace() {
  const ctx = useContext(EmployerWorkspaceContext);
  if (!ctx) {
    throw new Error('useEmployerWorkspace must be used within EmployerWorkspaceProvider');
  }
  return ctx;
}
