import { useCallback, useEffect, useRef, useState } from 'react';
import { recommendationsApi } from '@/api/recommendationsApi';
import { createRequestTimer } from '@/lib/apiDiagnostics';
import { readRecommendationsCache, writeRecommendationsCache } from '@/lib/recommendationsCache';
import type { Job } from '@/models/job';

export type RecommendationsStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useRecommendations(enabled: boolean) {
  const cached = enabled ? readRecommendationsCache() : [];
  const [jobs, setJobs] = useState<Job[]>(cached);
  const [status, setStatus] = useState<RecommendationsStatus>(enabled ? (cached.length ? 'ready' : 'loading') : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const hasCacheRef = useRef(cached.length > 0);

  const load = useCallback(async (): Promise<boolean> => {
    if (!enabled) {
      abortRef.current?.abort();
      setJobs([]);
      setStatus('idle');
      setError(null);
      setIsRefreshing(false);
      return true;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const showBackgroundRefresh = hasCacheRef.current;
    if (!showBackgroundRefresh) {
      setStatus('loading');
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    const timer = createRequestTimer('recommendation-calculation');

    try {
      const next = await recommendationsApi.getMine(12);
      if (controller.signal.aborted || requestId !== requestIdRef.current) {
        timer.cancel({ reason: 'stale-response' });
        return true;
      }

      setJobs(next);
      writeRecommendationsCache(next);
      hasCacheRef.current = next.length > 0;
      setStatus('ready');
      setIsRefreshing(false);
      timer.end({ count: next.length });
      return true;
    } catch (cause) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) {
        timer.cancel({ reason: 'aborted' });
        return true;
      }

      const reason = cause instanceof Error ? cause.message : 'Failed to load recommendations';
      setJobs((current) => (current.length > 0 ? current : readRecommendationsCache()));
      setStatus('ready');
      setIsRefreshing(false);
      setError(reason);
      timer.error(reason);
      return false;
    }
  }, [enabled]);

  useEffect(() => {
    void load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  return {
    jobs,
    status,
    loading: status === 'loading' && jobs.length === 0,
    refreshing: isRefreshing,
    ready: status === 'ready' || status === 'error',
    error,
    reload: load,
  };
}
