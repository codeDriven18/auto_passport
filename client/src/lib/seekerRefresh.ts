import { applicationsApi } from '@/api/applicationsApi';
import { dashboardApi } from '@/api/dashboardApi';
import { savedJobsApi } from '@/api/savedJobsApi';

/** Refresh saved jobs, applications, and dashboard recommendation data in parallel. */
export async function refreshSeekerAccountData() {
  const [saved, applications, dashboard] = await Promise.allSettled([
    savedJobsApi.getMine(),
    applicationsApi.getMine(),
    dashboardApi.getMyDashboard(),
  ]);

  return {
    saved: saved.status === 'fulfilled' ? saved.value : null,
    applications: applications.status === 'fulfilled' ? applications.value : null,
    dashboard: dashboard.status === 'fulfilled' ? dashboard.value : null,
    failed: [saved, applications, dashboard].some((result) => result.status === 'rejected'),
  };
}
