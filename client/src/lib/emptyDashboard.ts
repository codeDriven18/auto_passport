import type { UserDashboard } from '@/models/dashboard';

export const EMPTY_DASHBOARD: UserDashboard = {
  profileCompletionPercentage: 0,
  savedJobsCount: 0,
  applicationsCount: 0,
  recentApplications: [],
  recommendedJobs: [],
  recentlyViewedJobs: [],
  trendingJobs: [],
  followedCompanyJobs: [],
  unreadNotificationsCount: 0,
  swipeRemainingEstimate: 0,
};

export function mergeDashboardWithEmpty(data: UserDashboard | null | undefined): UserDashboard {
  if (!data) return { ...EMPTY_DASHBOARD };
  return {
    ...EMPTY_DASHBOARD,
    ...data,
    recentApplications: data.recentApplications ?? [],
    recommendedJobs: data.recommendedJobs ?? [],
    recentlyViewedJobs: data.recentlyViewedJobs ?? [],
    trendingJobs: data.trendingJobs ?? [],
    followedCompanyJobs: data.followedCompanyJobs ?? [],
  };
}
