import type { Job } from '@/models/job';
import { JobCategory, JobCategoryLabels, JobLevel, JobLevelLabels } from '@/models/enums';

export type WorkType = 'Remote' | 'Hybrid' | 'On-site';

export function getWorkType(job: Job): WorkType {
  if (job.isRemote) return 'Remote';
  const haystack = `${job.location ?? ''} ${job.city ?? ''}`.toLowerCase();
  if (haystack.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

export function getEmploymentType(job: Job): string {
  return job.category === JobCategory.Gig ? 'Contract' : 'Full-time';
}

export function getExperienceLevel(job: Job): string {
  if (job.level === JobLevel.NotApplicable) return JobCategoryLabels[job.category];
  return JobLevelLabels[job.level];
}

export function formatPostedTime(iso: string): string {
  const created = new Date(iso);
  const diffMs = Date.now() - created.getTime();
  const days = Math.floor(diffMs / 86_400_000);

  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function getLocationLabel(job: Job): string {
  return job.city ?? job.location ?? 'Flexible';
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
