import type { Job } from '@/models/job';
import { formatSalary } from '@/lib/jobFormat';
import { getLocationLabel, getWorkType } from '@/lib/jobCardMeta';
import { CompanyLogo } from '@/components/jobs/CompanyLogo';
import styles from './SwipeJobCardContent.module.css';

interface SwipeJobCardContentProps {
  job: Job;
}

export function SwipeJobCardContent({ job }: SwipeJobCardContentProps) {
  const workType = getWorkType(job);
  const location = getLocationLabel(job);
  const locationLine = workType && workType !== location
    ? `${location} · ${workType}`
    : location;

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <CompanyLogo name={job.company} logoUrl={job.companyLogoUrl} size="xl" className={styles.logo} />
        <span className={styles.company}>{job.company}</span>
      </header>

      <h2 className={styles.title}>{job.title}</h2>

      <p className={styles.salary}>
        {formatSalary(job.salaryMin, job.salaryMax, job.category, job.externalUrl)}
      </p>

      <p className={styles.location}>{locationLine}</p>
    </div>
  );
}
