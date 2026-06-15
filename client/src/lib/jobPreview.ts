import type { Job } from '@/models/job';
import { JobLevel } from '@/models/enums';
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
  /^about\s+(the\s+)?(role|job|position|company)\s*:/i,
  /^duties?\s*:/i,
  /^skills?\s*:/i,
  /^technologies?\s*:/i,
  /^tech\s*stack\s*:/i,
  /^must\s+have\s*:/i,
  /^nice\s+to\s+have\s*:/i,
  /^benefits?\s*:/i,
  /^we\s+are\s+looking\s+for\s*:/i,
  /^looking\s+for\s*:/i,
  /^company\s*:/i,
  /^employer\s*:/i,
  /^position\s*:/i,
  /^role\s*:/i,
  /^title\s*:/i,
  /^description\s*:/i,
  /^overview\s*:/i,
  /^summary\s*:/i,
  /^\*\s+/,
  /^[-•–]\s+/,
  /^[\d]+[.)]\s+/,
];

const BAD_SUMMARY_PATTERNS = [
  ...BAD_TITLE_PATTERNS,
  /^experience\s*:/i,
  /^education\s*:/i,
  /^contact\s*:/i,
];

const FIELD_LABEL_PREFIX =
  /^(company|technologies?|tech\s*stack|requirements?|skills?|responsibilities?|qualifications?|role|position|title|description|overview|summary|employer)\s*:\s*/i;

function stripFieldLabels(text: string): string {
  return text.replace(FIELD_LABEL_PREFIX, '').trim();
}

function stripAllFieldLabels(text: string): string {
  let result = text.trim();
  let prev = '';
  while (result !== prev) {
    prev = result;
    result = stripFieldLabels(result);
  }
  return result;
}

const MAX_DISPLAY_TITLE = 50;
const MAX_DISPLAY_SUMMARY = 120;
const MAX_DISPLAY_TAGS = 5;

function looksLikeCompanySkillsTitle(text: string): boolean {
  const colonParts = text.split(':').map((part) => part.trim()).filter(Boolean);
  if (colonParts.length < 2) return false;

  const tail = colonParts.slice(1).join(': ');
  const commaParts = tail.split(',').map((part) => part.trim()).filter(Boolean);
  if (commaParts.length >= 2 && commaParts.every((part) => part.length <= 28)) return true;

  return colonParts.length >= 3;
}

function looksLikeBadCardTitle(text: string): boolean {
  const trimmed = stripAllFieldLabels(text);
  if (!trimmed) return true;
  if (trimmed.length > MAX_DISPLAY_TITLE) return true;
  if (BAD_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  if (looksLikeCompanySkillsTitle(trimmed)) return true;
  const lines = trimmed.split(/\n+/).filter(Boolean);
  if (lines.length > 1) return true;
  const commaParts = trimmed.split(',').map((part) => part.trim());
  if (commaParts.length >= 4 && commaParts.every((part) => part.length < 24)) return true;
  if (/^[A-Z#][\w+#./-]+(?:\s*[,•|]\s*[A-Z#][\w+#./-]+){3,}/.test(trimmed)) return true;
  return false;
}

function clampTitle(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_DISPLAY_TITLE) return trimmed;
  const slice = trimmed.slice(0, MAX_DISPLAY_TITLE);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 24) return `${slice.slice(0, lastSpace).trim()}…`;
  return `${slice.trim()}…`;
}

function looksLikeBadCardSummary(text: string): boolean {
  const trimmed = stripFieldLabels(text);
  if (!trimmed) return true;
  if (trimmed.length > 180) return true;
  if (BAD_SUMMARY_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  const bulletLines = trimmed.split(/\n+/).filter((line) => /^[\s*•\-–\d.)]+/.test(line));
  if (bulletLines.length >= 2) return true;
  return false;
}

function inferTitleFromSkills(job: Job): string | null {
  const skills = job.displaySkills?.length
    ? job.displaySkills
    : job.tags.map((tag) => tag.name);
  if (skills.length === 0) return null;

  const primary = skills.slice(0, 2).join(' ');
  if (!primary.trim()) return null;

  const levelHint = job.level === JobLevel.Junior ? 'Junior '
    : job.level === JobLevel.MidLevel ? 'Mid '
    : job.level === JobLevel.Internship ? 'Intern '
    : '';
  return `${levelHint}${primary} Developer`.replace(/\s+/g, ' ').trim();
}

function pickTitle(job: Job): string {
  const candidates = [
    job.displayTitle,
    job.title,
  ]
    .map((value) => stripAllFieldLabels(value?.trim() ?? ''))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (!looksLikeBadCardTitle(candidate)) return clampTitle(candidate);
  }

  const inferred = inferTitleFromSkills(job);
  if (inferred) return clampTitle(inferred);

  const company = job.displayCompany?.trim() || job.company?.trim();
  if (company) return clampTitle(`Role at ${company}`);

  return 'Open position';
}

function sanitizeCardSummary(displaySummary: string | undefined, job: Job): string {
  const display = stripAllFieldLabels(displaySummary?.trim() ?? '');
  if (display && !looksLikeBadCardSummary(display)) {
    return display.length > MAX_DISPLAY_SUMMARY
      ? `${display.slice(0, MAX_DISPLAY_SUMMARY - 1).trim()}…`
      : display;
  }

  const company = job.displayCompany?.trim() || job.company?.trim();
  if (company) {
    return `Opportunity at ${company}. Tap to view full details.`;
  }

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
  if (city && location && city !== location) return city;
  if (city) return city;
  if (location) return location;
  if (job.isRemote) return 'Remote';
  return 'Location flexible';
}

function resolveSkills(job: Job): string[] {
  const source = job.displaySkills?.length
    ? job.displaySkills
    : job.tags.map((tag) => tag.name);
  const skills = source.map((skill) => skill.trim()).filter(Boolean);
  const unique = [...new Set(skills)];
  if (unique.length <= MAX_DISPLAY_TAGS) return unique.slice(0, MAX_DISPLAY_TAGS);
  return unique.slice(0, MAX_DISPLAY_TAGS);
}

export function getJobCardPreview(job: Job): JobCardPreview {
  const skills = resolveSkills(job);

  return {
    title: pickTitle(job),
    company: job.displayCompany?.trim() || job.company?.trim() || 'Company confidential',
    salary: resolveSalary(job),
    location: resolveLocation(job),
    skills,
    summary: sanitizeCardSummary(job.displaySummary, job),
    tagsLine: skills.join(' • '),
  };
}

export function getSwipeJobPreview(job: Job): JobCardPreview {
  return getJobCardPreview(job);
}

/** Sanitize moderation candidate titles for compact admin cards. */
export function sanitizeCandidateCardTitle(title?: string, companyName?: string): string {
  const trimmed = stripFieldLabels(title?.trim() ?? '');
  if (trimmed && !looksLikeBadCardTitle(trimmed)) return trimmed;

  const company = companyName?.trim();
  if (company) return `Role at ${company}`;

  return 'Untitled role';
}
