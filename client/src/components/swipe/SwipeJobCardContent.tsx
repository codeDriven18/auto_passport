import type { Job } from '@/models/job';
import { formatSalary } from '@/lib/jobFormat';
import {
  formatPostedTime,
  getEmploymentType,
  getExperienceLevel,
  getLocationLabel,
  getWorkType,
  stripHtml,
} from '@/lib/jobCardMeta';
import { getMatchScore } from '@/lib/jobMatch';
import { CompanyLogo } from '@/components/jobs/CompanyLogo';
import styles from './SwipeJobCardContent.module.css';

interface SwipeJobCardContentProps {
  job: Job;
}

export function SwipeJobCardContent({ job }: SwipeJobCardContentProps) {
  const skills = job.tags.slice(0, 5);
  const description = stripHtml(job.description);
  const workType = getWorkType(job);

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <CompanyLogo name={job.company} logoUrl={job.companyLogoUrl} size="xl" />
        <div className={styles.headerText}>
          <span className={styles.company}>{job.company}</span>
        </div>
        <span className={styles.matchBadge} aria-label={`${getMatchScore(job)} percent match`}>
          {getMatchScore(job)}%
        </span>
      </header>

      <div className={styles.primary}>
        <h2 className={styles.title}>{job.title}</h2>
        <p className={styles.salary}>
          {formatSalary(job.salaryMin, job.salaryMax, job.category, job.externalUrl)}
        </p>
        <div className={styles.locationRow}>
          <span>{getLocationLabel(job)}</span>
          <span className={styles.workBadge}>{workType}</span>
        </div>
      </div>

      <div className={styles.secondary}>
        <span>{getExperienceLevel(job)}</span>
        <span className={styles.dot} aria-hidden>·</span>
        <span>{getEmploymentType(job)}</span>
        <span className={styles.dot} aria-hidden>·</span>
        <span>{formatPostedTime(job.createdAt)}</span>
      </div>

      {skills.length > 0 && (
        <div className={styles.skills}>
          {skills.map((tag) => (
            <span key={tag.id} className={styles.skill}>{tag.name}</span>
          ))}
        </div>
      )}

      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
}
