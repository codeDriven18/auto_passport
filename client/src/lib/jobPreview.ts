import type { Job } from '@/models/job';
import { formatSalary } from '@/lib/jobFormat';

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

const BAD_TITLE_PATTERNS = [
  /^requirements?\s*:/i,
  /^responsibilities?\s*:/i,
  /^qualifications?\s*:/i,
  /^job\s*description\s*:/i,
  /^about\s+(the\s+)?(role|job|position)\s*:/i,
  /^duties?\s*:/i,
  /^skills?\s*:/i,
  /^must\s+have\s*:/i,
  /^nice\s+to\s+have\s*:/i,
  /^benefits?\s*:/i,
  /^we\s+are\s+looking\s+for\s*:/i,
  /^looking\s+for\s*:/i,
  /^\*\s+/,
  /^[-•–]\s+/,
  /^[\d]+[.)]\s+/,
];

function looksLikeBadCardTitle(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length > 72) return true;
  if (BAD_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  const lines = trimmed.split(/\n+/).filter(Boolean);
  if (lines.length > 1) return true;
  const commaParts = trimmed.split(',').map((part) => part.trim());
  if (commaParts.length >= 4 && commaParts.every((part) => part.length < 24)) return true;
  return false;
}

function looksLikeBadCardSummary(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length > 220) return true;
  if (BAD_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  const bulletLines = trimmed.split(/\n+/).filter((line) => /^[\s*•\-–\d.)]+/.test(line));
  if (bulletLines.length >= 2) return true;
  return false;
}

function inferTitleFromSkills(job: Job): string | null {
  const skills = job.displaySkills?.length
    ? job.displaySkills
    : job.tags.map((tag) => tag.name);
  if (skills.length === 0) return null;

  const label = skills.slice(0, 2).join(' ');
  if (!label.trim()) return null;
  return `${label} Developer`;
}

function sanitizeCardTitle(raw: string | undefined, job: Job): string {
  const display = raw?.trim();
  if (display && !looksLikeBadCardTitle(display)) return display;

  const extracted = job.title?.trim();
  if (extracted && !looksLikeBadCardTitle(extracted)) return extracted;

  const inferred = inferTitleFromSkills(job);
  if (inferred) return inferred;

  const company = job.displayCompany?.trim() || job.company?.trim();
  if (company) return `Role at ${company}`;

  return 'Open position';
}

function sanitizeCardSummary(displaySummary: string | undefined): string {
  const display = displaySummary?.trim();
  if (display && !looksLikeBadCardSummary(display)) return display;
  return '';
}

function resolveSalary(job: Job): string {
  const display = job.displaySalary?.trim();
  if (display) return display;

  const formatted = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.category,
    job.externalUrl,
  );
  return formatted === 'Salary not listed' ? 'Not disclosed' : formatted;
}

function resolveLocation(job: Job): string {
  const display = job.displayLocation?.trim();
  if (display) return display;

  const city = job.city?.trim();
  const location = job.location?.trim();
  if (city && location && city !== location) return `${city} · ${location}`;
  if (city) return city;
  if (location) return location;
  if (job.isRemote) return 'Remote';
  return 'Location flexible';
}

function resolveSkills(job: Job): string[] {
  if (job.displaySkills?.length) {
    return job.displaySkills.slice(0, 5).map((skill) => skill.trim()).filter(Boolean);
  }
  return job.tags.slice(0, 5).map((tag) => tag.name.trim()).filter(Boolean);
}

export function getJobCardPreview(job: Job): JobCardPreview {
  const skills = resolveSkills(job);

  return {
    title: sanitizeCardTitle(job.displayTitle, job),
    company: job.displayCompany?.trim() || job.company?.trim() || 'Company confidential',
    salary: resolveSalary(job),
    location: resolveLocation(job),
    skills,
    summary: sanitizeCardSummary(job.displaySummary),
    tagsLine: skills.join(' • '),
  };
}

export function getSwipeJobPreview(job: Job): JobCardPreview {
  return getJobCardPreview(job);
}

/** Sanitize moderation candidate titles for compact admin cards. */
export function sanitizeCandidateCardTitle(title?: string, companyName?: string): string {
  const trimmed = title?.trim();
  if (trimmed && !looksLikeBadCardTitle(trimmed)) return trimmed;

  const company = companyName?.trim();
  if (company) return `Role at ${company}`;

  return 'Untitled role';
}
