export enum JobCategory {
  Gig = 0,
  It = 1,
}

export enum JobLevel {
  NotApplicable = 0,
  Internship = 1,
  Junior = 2,
  MidLevel = 3,
}

export enum ApplicationStatus {
  Pending = 0,
  Submitted = 1,
  UnderReview = 2,
  Accepted = 3,
  Rejected = 4,
  Withdrawn = 5,
}

export enum SourceType {
  Manual = 0,
  Telegram = 1,
  ExternalApi = 2,
}

export const JobCategoryLabels: Record<JobCategory, string> = {
  [JobCategory.Gig]: 'Gig',
  [JobCategory.It]: 'IT',
};

export const JobLevelLabels: Record<JobLevel, string> = {
  [JobLevel.NotApplicable]: '—',
  [JobLevel.Internship]: 'Internship',
  [JobLevel.Junior]: 'Junior',
  [JobLevel.MidLevel]: 'Mid-Level',
};

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: 'Pending',
  [ApplicationStatus.Submitted]: 'Submitted',
  [ApplicationStatus.UnderReview]: 'Under Review',
  [ApplicationStatus.Accepted]: 'Accepted',
  [ApplicationStatus.Rejected]: 'Rejected',
  [ApplicationStatus.Withdrawn]: 'Withdrawn',
};
