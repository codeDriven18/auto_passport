import type { JobApplication } from '@/models/application';
import type { Job } from '@/models/job';

export interface UserInterest {
  preferredCategories: Record<string, number>;
  preferredTechnologies: Record<string, number>;
  preferredCities: Record<string, number>;
  preferredSalaryMin?: number;
  preferredSalaryMax?: number;
  lastCalculatedAt: string;
}

export interface UserDashboard {
  profileCompletionPercentage: number;
  savedJobsCount: number;
  applicationsCount: number;
  recentApplications: JobApplication[];
  recommendedJobs: Job[];
  recentlyViewedJobs: Job[];
  trendingJobs: Job[];
  followedCompanyJobs: Job[];
  interests?: UserInterest;
  unreadNotificationsCount: number;
  swipeRemainingEstimate: number;
  lastSwipeAt?: string;
}
