import { useMemo } from 'react';
import type { Job } from '@/models/job';
import { getJobCardPreview } from '@/lib/jobPreview';
import { getEmploymentType } from '@/lib/jobCardMeta';
import { CompanyLogo } from '@/components/jobs/CompanyLogo';
import { IconMapPin } from '@/components/icons/Icons';
import styles from './SwipeCard.module.css';

interface SwipeCardProps {
  job: Job;
  attachedDock?: boolean;
}

export function SwipeCard({ job, attachedDock = true }: SwipeCardProps) {
  const preview = useMemo(() => getJobCardPreview(job), [job]);
  const employment = getEmploymentType(job);

  return (
    <article className={`${styles.card} ${attachedDock ? styles.attached : ''}`}>
      <div className={styles.inner}>
        <CompanyLogo
          name={preview.company}
          logoUrl={job.companyLogoUrl}
          size="swipe"
          className={styles.logo}
        />

        <h2 className={styles.title}>{preview.title}</h2>
        <p className={styles.company}>{preview.company}</p>

        <div className={styles.facts}>
          <p className={styles.location}>
            <IconMapPin size={15} aria-hidden />
            <span>{preview.location}</span>
          </p>
          <p className={styles.salary}>
            <span className={styles.salaryIcon} aria-hidden>💰</span>
            <span>{preview.salary}</span>
          </p>
        </div>

        {preview.skills.length > 0 && (
          <div className={styles.chips} aria-label="Key skills">
            {preview.skills.map((skill) => (
              <span key={skill} className={styles.chip}>{skill}</span>
            ))}
          </div>
        )}

        {preview.summary ? (
          <p className={styles.summary}>{preview.summary}</p>
        ) : null}

        <div className={styles.footer}>
          <span className={styles.typeBadge}>{employment}</span>
        </div>
      </div>
    </article>
  );
}
