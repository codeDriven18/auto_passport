import type { Job } from '@/models/job';

const MAX_DISPLAY_TITLE = 55;
const MAX_DISPLAY_SUMMARY = 120;
const MIN_DISPLAY_TAGS = 3;
const MAX_DISPLAY_TAGS = 5;

export interface JobCardPreview {
  title: string;
  company: string;
  salary: string;
  location: string;
  skills: string[];
  summary: string;
  tagsLine: string;
}

/** @deprecated Use JobCardPreview */
export type SwipeJobPreview = JobCardPreview;

function clampTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'Open position';
  if (trimmed.length <= MAX_DISPLAY_TITLE) return trimmed;
  const slice = trimmed.slice(0, MAX_DISPLAY_TITLE);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 20) return `${slice.slice(0, lastSpace).trim()}…`;
  return `${slice.trim()}…`;
}

function clampSummary(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (trimmed.length <= MAX_DISPLAY_SUMMARY) return trimmed;
  const slice = trimmed.slice(0, MAX_DISPLAY_SUMMARY);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 48) return `${slice.slice(0, lastSpace).trim()}…`;
  return `${slice.trim()}…`;
}

function resolveDisplayTags(job: Job): string[] {
  const source = job.displayTags?.length
    ? job.displayTags
    : job.displaySkills ?? [];
  const tags = source.map((tag) => tag.trim()).filter(Boolean);
  const unique = [...new Set(tags)];
  return unique.slice(0, MAX_DISPLAY_TAGS);
}

function genericFallbackSummary(company: string): string {
  if (company && company !== 'Company confidential') {
    return `Opportunity at ${company}.`;
  }
  return 'Tap to view role details.';
}

export function getJobCardPreview(job: Job): JobCardPreview {
  const title = clampTitle(job.displayTitle?.trim() || 'Open position');
  const company = job.displayCompany?.trim() || 'Company confidential';
  const salary = job.displaySalary?.trim() || 'Not disclosed';
  const location = job.displayLocation?.trim() || 'Location flexible';
  const skills = resolveDisplayTags(job);
  const summary = clampSummary(job.displaySummary?.trim() || '') || genericFallbackSummary(company);

  const paddedSkills = skills.length >= MIN_DISPLAY_TAGS
    ? skills
    : skills;

  return {
    title,
    company,
    salary,
    location,
    skills: paddedSkills,
    summary,
    tagsLine: paddedSkills.join(' • '),
  };
}

export function getSwipeJobPreview(job: Job): JobCardPreview {
  return getJobCardPreview(job);
}

/** Sanitize moderation candidate titles for compact admin cards. */
export function sanitizeCandidateCardTitle(title?: string, companyName?: string): string {
  const trimmed = title?.trim() ?? '';
  if (trimmed) return clampTitle(trimmed);

  const company = companyName?.trim();
  if (company) return `Role at ${company}`;

  return 'Untitled role';
}
