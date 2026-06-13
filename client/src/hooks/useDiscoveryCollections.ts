import { useEffect, useState } from 'react';
import { jobsApi } from '@/api/jobsApi';
import type { Job } from '@/models/job';

export interface DiscoveryCollections {
  remote: Job[];
  graduate: Job[];
  highSalary: Job[];
  trending: Job[];
  recentlyAdded: Job[];
}

export function useDiscoveryCollections(enabled: boolean) {
  const [collections, setCollections] = useState<DiscoveryCollections>({
    remote: [],
    graduate: [],
    highSalary: [],
    trending: [],
    recentlyAdded: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      jobsApi.search({ isRemote: true, pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
      jobsApi.search({ pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
      jobsApi.search({ pageSize: 12, sortBy: 'salary', sortOrder: 'desc', salaryMin: 1 }),
      jobsApi.search({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
      jobsApi.search({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
    ])
      .then(([remote, all, highSalary, trendingPool, recent]) => {
        if (cancelled) return;
        const graduate = all.items.filter(
          (j) => j.level === 1 || j.level === 2,
        );
        setCollections({
          remote: remote.items,
          graduate: graduate.slice(0, 12),
          highSalary: highSalary.items,
          trending: trendingPool.items.filter((j) => (j.trendingBadges?.length ?? 0) > 0).slice(0, 12),
          recentlyAdded: recent.items,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  return { collections, loading };
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export { getTimeGreeting };
