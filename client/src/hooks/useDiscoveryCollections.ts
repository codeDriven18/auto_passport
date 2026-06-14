import { useCallback, useEffect, useRef, useState } from 'react';
import { jobsApi } from '@/api/jobsApi';
import type { Job } from '@/models/job';

export interface DiscoveryCollections {
  remote: Job[];
  graduate: Job[];
  highSalary: Job[];
  trending: Job[];
  recentlyAdded: Job[];
}

const EMPTY: DiscoveryCollections = {
  remote: [],
  graduate: [],
  highSalary: [],
  trending: [],
  recentlyAdded: [],
};

async function fetchCollections(): Promise<DiscoveryCollections> {
  const [remote, all, highSalary, trendingPool, recent] = await Promise.all([
    jobsApi.search({ isRemote: true, pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
    jobsApi.search({ pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    jobsApi.search({ pageSize: 12, sortBy: 'salary', sortOrder: 'desc', salaryMin: 1 }),
    jobsApi.search({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
    jobsApi.search({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
  ]);

  const graduate = all.items.filter((job) => job.level === 1 || job.level === 2);

  return {
    remote: remote.items,
    graduate: graduate.slice(0, 12),
    highSalary: highSalary.items,
    trending: trendingPool.items.filter((job) => (job.trendingBadges?.length ?? 0) > 0).slice(0, 12),
    recentlyAdded: recent.items,
  };
}

export function useDiscoveryCollections(enabled: boolean) {
  const [collections, setCollections] = useState<DiscoveryCollections>(EMPTY);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const reload = useCallback(async () => {
    if (!enabled || inFlightRef.current) return false;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const next = await fetchCollections();
      setCollections(next);
      return true;
    } catch {
      return false;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void reload();
  }, [enabled, reload]);

  return { collections, loading, reload };
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export { getTimeGreeting };
