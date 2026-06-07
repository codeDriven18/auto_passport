import { useCallback } from 'react';
import { activityApi } from '@/api/activityApi';
import { useAuth } from '@/context/AuthContext';
import { ActivityType } from '@/models/personalization';

export function useActivityTracking() {
  const { isAuthenticated } = useAuth();

  const record = useCallback(async (
    activityType: ActivityType,
    jobId?: string,
    companyId?: string,
  ) => {
    if (!isAuthenticated) return;
    try {
      await activityApi.record({ activityType, jobId, companyId });
    } catch {
      /* non-blocking */
    }
  }, [isAuthenticated]);

  const trackJobView = useCallback((jobId: string) => record(ActivityType.JobViewed, jobId), [record]);
  const trackJobSkip = useCallback((jobId: string) => record(ActivityType.JobSkipped, jobId), [record]);
  const trackJobSave = useCallback((jobId: string) => record(ActivityType.JobSaved, jobId), [record]);
  const trackJobApply = useCallback((jobId: string) => record(ActivityType.JobApplied, jobId), [record]);
  const trackCompanyView = useCallback((companyId: string) => record(ActivityType.CompanyViewed, undefined, companyId), [record]);

  return { trackJobView, trackJobSkip, trackJobSave, trackJobApply, trackCompanyView };
}
