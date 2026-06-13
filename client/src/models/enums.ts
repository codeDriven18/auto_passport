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

export enum SourceTrustLevel {
  Unknown = 0,
  Community = 1,
  Standard = 2,
  Verified = 3,
  Trusted = 4,
}

export const SourceTrustLevelLabels: Record<SourceTrustLevel, string> = {
  [SourceTrustLevel.Unknown]: 'Unverified source',
  [SourceTrustLevel.Community]: 'Community source',
  [SourceTrustLevel.Standard]: 'Standard source',
  [SourceTrustLevel.Verified]: 'Verified source',
  [SourceTrustLevel.Trusted]: 'Trusted source',
};

export enum CandidateTrustLevel {
  None = 0,
  Verified = 1,
  Strong = 2,
  Complete = 3,
}

export const CandidateTrustLevelLabels: Record<CandidateTrustLevel, string> = {
  [CandidateTrustLevel.None]: 'Unverified',
  [CandidateTrustLevel.Verified]: 'Verified Candidate',
  [CandidateTrustLevel.Strong]: 'Strong Candidate',
  [CandidateTrustLevel.Complete]: 'Complete Candidate',
};

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
