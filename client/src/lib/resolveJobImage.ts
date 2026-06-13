import type { Job } from '@/models/job';
import { getJobHeroVisual, type JobHeroTheme } from '@/lib/jobHeroVisual';

export type JobImageSource = 'employer' | 'ai' | 'category';

export interface ResolvedJobImage {
  url: string;
  source: JobImageSource;
  theme: JobHeroTheme;
  gradient: string;
  accent: string;
}

const CATEGORY_IMAGES: Record<JobHeroTheme, string> = {
  engineering: '/job-images/engineering.svg',
  design: '/job-images/design.svg',
  marketing: '/job-images/marketing.svg',
  product: '/job-images/product.svg',
  data: '/job-images/data.svg',
  gig: '/job-images/default.svg',
  default: '/job-images/default.svg',
};

export function resolveJobImage(job: Job): ResolvedJobImage {
  const visual = getJobHeroVisual(job);

  if (job.jobImageUrl?.trim()) {
    return {
      url: job.jobImageUrl.trim(),
      source: 'employer',
      theme: visual.theme,
      gradient: visual.gradient,
      accent: visual.accent,
    };
  }

  if (job.aiGeneratedImageUrl?.trim()) {
    return {
      url: job.aiGeneratedImageUrl.trim(),
      source: 'ai',
      theme: visual.theme,
      gradient: visual.gradient,
      accent: visual.accent,
    };
  }

  return {
    url: CATEGORY_IMAGES[visual.theme],
    source: 'category',
    theme: visual.theme,
    gradient: visual.gradient,
    accent: visual.accent,
  };
}
