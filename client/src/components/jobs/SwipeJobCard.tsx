import { useMemo, useState } from 'react';
import type { Job } from '@/models/job';
import { SourceTrustLevel } from '@/models/enums';
import { getSwipeJobPreview } from '@/lib/jobPreview';
import { formatPostedTime } from '@/lib/jobCardMeta';
import { resolveJobImage } from '@/lib/resolveJobImage';
import { JobHeroImage } from '@/components/jobs/JobHeroImage';
import { CompanyLogo } from '@/components/jobs/CompanyLogo';
import { JobShareMenu } from '@/components/jobs/JobShareMenu';
import { IconBookmark, IconVerified } from '@/components/icons/Icons';
import styles from './SwipeJobCard.module.css';

interface SwipeJobCardProps {
  job: Job;
  interactive?: boolean;
}

export function SwipeJobCard({ job, interactive = true }: SwipeJobCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const heroImage = useMemo(() => resolveJobImage(job), [job]);
  const preview = useMemo(() => getSwipeJobPreview(job), [job]);
  const isTrustedSource = (job.sourceTrustLevel ?? SourceTrustLevel.Unknown) >= SourceTrustLevel.Verified;

  return (
    <>
      <article className={styles.card}>
        <div className={styles.hero}>
          <JobHeroImage
            image={heroImage}
            alt={`${preview.title} at ${preview.company}`}
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroTop}>
            {job.sourceName && (
              <span className={styles.sourceBadge}>
                {isTrustedSource && <IconVerified size={14} className={styles.sourceIcon} />}
                {job.sourceName}
              </span>
            )}
            {interactive && (
              <button
                type="button"
                className={styles.heroAction}
                aria-label="Share job"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShareOpen(true);
                }}
              >
                <IconBookmark size={18} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.companyRow}>
            <CompanyLogo name={preview.company} logoUrl={job.companyLogoUrl} size="md" />
            <div className={styles.companyText}>
              <span className={styles.companyName}>{preview.company}</span>
            </div>
          </div>

          <h2 className={styles.title}>{preview.title}</h2>

          <div className={styles.pills}>
            <span className={styles.pillAccent}>{preview.salary}</span>
            <span className={styles.pill}>{preview.location}</span>
          </div>

          {preview.summary && <p className={styles.summary}>{preview.summary}</p>}

          {preview.skills.length > 0 && (
            <div className={styles.tags}>
              {preview.skills.map((skill) => (
                <span key={skill} className={styles.tag}>{skill}</span>
              ))}
            </div>
          )}

          <footer className={styles.footer}>
            {job.sourceName && (
              <span className={styles.footerSource}>Source: {job.sourceName}</span>
            )}
            <span className={styles.footerTime}>{formatPostedTime(job.createdAt)}</span>
          </footer>
        </div>
      </article>

      <JobShareMenu job={job} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
