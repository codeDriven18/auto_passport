import type { Job } from '@/models/job';
import { JobCategory } from '@/models/enums';

export type JobHeroTheme =
  | 'engineering'
  | 'design'
  | 'marketing'
  | 'product'
  | 'data'
  | 'gig'
  | 'default';

export interface JobHeroVisual {
  theme: JobHeroTheme;
  label: string;
  gradient: string;
  accent: string;
}

const THEME_MAP: Record<JobHeroTheme, Omit<JobHeroVisual, 'theme'>> = {
  engineering: {
    label: 'Engineering',
    gradient: 'linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #0ea5e9 100%)',
    accent: '#38bdf8',
  },
  design: {
    label: 'Design',
    gradient: 'linear-gradient(165deg, #1a1025 0%, #5b21b6 45%, #f472b6 100%)',
    accent: '#e879f9',
  },
  marketing: {
    label: 'Marketing',
    gradient: 'linear-gradient(165deg, #1c1917 0%, #c2410c 48%, #fbbf24 100%)',
    accent: '#fb923c',
  },
  product: {
    label: 'Product',
    gradient: 'linear-gradient(165deg, #0c1222 0%, #1d4ed8 50%, #60a5fa 100%)',
    accent: '#93c5fd',
  },
  data: {
    label: 'Data & AI',
    gradient: 'linear-gradient(165deg, #042f2e 0%, #0f766e 45%, #2dd4bf 100%)',
    accent: '#5eead4',
  },
  gig: {
    label: 'Gig',
    gradient: 'linear-gradient(165deg, #171717 0%, #ca8a04 55%, #fde047 100%)',
    accent: '#facc15',
  },
  default: {
    label: 'Opportunity',
    gradient: 'linear-gradient(165deg, #0a0a0a 0%, #374151 50%, #ffd600 100%)',
    accent: '#ffd600',
  },
};

function inferTheme(job: Job): JobHeroTheme {
  const haystack = [
    job.title,
    job.description,
    ...job.tags.map((t) => t.name),
  ].join(' ').toLowerCase();

  if (/\b(design|designer|figma|ui|ux|creative)\b/.test(haystack)) return 'design';
  if (/\b(marketing|growth|seo|content|brand|campaign)\b/.test(haystack)) return 'marketing';
  if (/\b(product manager|product owner|pm\b)\b/.test(haystack)) return 'product';
  if (/\b(data|ml|machine learning|ai|analyst|scientist)\b/.test(haystack)) return 'data';
  if (/\b(developer|engineer|backend|frontend|full.?stack|devops|software|react|node|java|python)\b/.test(haystack)) {
    return 'engineering';
  }
  if (job.category === JobCategory.Gig) return 'gig';
  return 'default';
}

export function getJobHeroVisual(job: Job): JobHeroVisual {
  const theme = inferTheme(job);
  return { theme, ...THEME_MAP[theme] };
}

export function getJobShareUrl(jobId: string): string {
  if (typeof window === 'undefined') return `/jobs/${jobId}`;
  return `${window.location.origin}/jobs/${jobId}`;
}

/** @deprecated Use SourceBadge component instead */
export function formatSourceAttribution(sourceName?: string | null): string | null {
  if (!sourceName?.trim()) return null;
  return sourceName.trim();
}
