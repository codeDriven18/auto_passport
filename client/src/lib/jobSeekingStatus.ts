export type JobSeekingStatus =
  | 'ActivelyLooking'
  | 'OpenToOpportunities'
  | 'CasuallyBrowsing'
  | 'NotLooking';

export const JOB_SEEKING_STATUS_LABELS: Record<JobSeekingStatus, string> = {
  ActivelyLooking: 'Actively Looking',
  OpenToOpportunities: 'Open To Opportunities',
  CasuallyBrowsing: 'Casually Browsing',
  NotLooking: 'Not Looking',
};

export const JOB_SEEKING_STATUS_OPTIONS: JobSeekingStatus[] = [
  'ActivelyLooking',
  'OpenToOpportunities',
  'CasuallyBrowsing',
  'NotLooking',
];

export function formatJobSeekingStatus(value?: string | null): string {
  if (!value) return JOB_SEEKING_STATUS_LABELS.ActivelyLooking;
  return JOB_SEEKING_STATUS_LABELS[value as JobSeekingStatus] ?? JOB_SEEKING_STATUS_LABELS.ActivelyLooking;
}
