import type { Job } from '@/models/job';

export interface SwipeJobPreview {
  title: string;
  company: string;
  salary: string;
  location: string;
  skills: string[];
  summary: string;
}

export function getSwipeJobPreview(job: Job): SwipeJobPreview {
  const skills =
    job.displaySkills?.length
      ? job.displaySkills.slice(0, 5)
      : job.tags.slice(0, 5).map((tag) => tag.name);

  return {
    title: job.displayTitle?.trim() || job.title,
    company: job.displayCompany?.trim() || job.company,
    salary: job.displaySalary?.trim() || 'Not disclosed',
    location: job.displayLocation?.trim() || 'Location not specified',
    skills,
    summary: job.displaySummary?.trim() || '',
  };
}
