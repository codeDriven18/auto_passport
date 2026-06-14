import { useMemo, useState, type ReactNode } from 'react';
import type { Job } from '@/models/job';
import { SourceTrustLevel } from '@/models/enums';
import { getJobCardPreview } from '@/lib/jobPreview';
import { formatPostedTime, getEmploymentType, getWorkType } from '@/lib/jobCardMeta';
import { resolveJobImage } from '@/lib/resolveJobImage';
import { JobHeroImage } from '@/components/jobs/JobHeroImage';
import { SourceBadge } from '@/components/jobs/SourceBadge';
import { CompanyIdentityStrip } from '@/components/jobs/CompanyIdentityStrip';
import { CompanyLogo } from '@/components/jobs/CompanyLogo';
import { JobShareMenu } from '@/components/jobs/JobShareMenu';
import { IconBookmark, IconVerified } from '@/components/icons/Icons';
import styles from './OpportunityCard.module.css';

export interface OpportunityCardProps {
  job: Job;
  variant?: 'swipe' | 'discover' | 'compact';
  interactive?: boolean;
  saved?: boolean;
  applied?: boolean;
  applying?: boolean;
  onLearnMore?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  onApply?: (e: React.MouseEvent) => void;
  heroBadge?: ReactNode;
  heroAction?: ReactNode;
  footerExtra?: ReactNode;
}

export function OpportunityCard({
  job,
  variant = 'discover',
  interactive = true,
  saved = false,
  applied = false,
  applying = false,
  onLearnMore,
  onSave,
  onApply,
  heroBadge,
  heroAction,
  footerExtra,
}: OpportunityCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const heroImage = useMemo(() => resolveJobImage(job), [job]);
  const preview = useMemo(() => getJobCardPreview(job), [job]);
  const isTrustedSource =
    (job.sourceTrustLevel ?? SourceTrustLevel.Unknown) >= SourceTrustLevel.Verified;
  const workType = getWorkType(job);
  const employment = getEmploymentType(job);
  const showActions = variant === 'discover' && interactive;
  const isSwipe = variant === 'swipe';

  return (
    <>
      <article className={`${styles.card} ${styles[variant]}`}>
        <div className={styles.hero} aria-hidden={!interactive}>
          <JobHeroImage
            image={heroImage}
            alt={`${preview.title} at ${preview.company}`}
            className={styles.heroImage}
            priority={isSwipe}
          />

          {isSwipe ? (
            <div className={styles.heroTop}>
              {job.sourceName && (
                <span className={styles.sourceBadge}>
                  {isTrustedSource && (
                    <IconVerified size={14} className={styles.sourceIcon} />
                  )}
                  {job.sourceName}
                </span>
              )}
              {interactive && !heroAction && (
                <button
                  type="button"
                  className={styles.heroAction}
                  aria-label="Share job"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShareOpen(true);
                  }}
                >
                  <IconBookmark size={18} />
                </button>
              )}
              {heroAction}
            </div>
          ) : (
            <div className={styles.heroOverlay}>
              <div className={styles.heroOverlayTop}>
                {heroBadge}
                {heroAction}
              </div>
              <SourceBadge job={job} className={styles.source} />
              <CompanyIdentityStrip job={job} variant="compact" onDark />
            </div>
          )}
        </div>

        <div className={styles.body}>
          {isSwipe && (
            <div className={styles.companyRow}>
              <CompanyLogo
                name={preview.company}
                logoUrl={job.companyLogoUrl}
                size="md"
              />
              <div className={styles.companyText}>
                <span className={styles.companyName}>{preview.company}</span>
              </div>
            </div>
          )}

          {!isSwipe && (
            <p className={styles.companyLine}>{preview.company}</p>
          )}

          <h3 className={styles.title}>{preview.title}</h3>

          <div className={styles.pills}>
            <span className={styles.pillAccent}>{preview.salary}</span>
            <span className={styles.pill}>{preview.location}</span>
            {variant === 'discover' && (
              <>
                <span className={styles.pill}>{workType}</span>
                <span className={styles.pill}>{employment}</span>
              </>
            )}
          </div>

          {preview.summary && (
            <p className={styles.summary}>{preview.summary}</p>
          )}

          {preview.skills.length > 0 && (
            <div className={styles.tags} title={preview.tagsLine}>
              {isSwipe ? (
                preview.skills.map((skill) => (
                  <span key={skill} className={styles.tag}>{skill}</span>
                ))
              ) : (
                <span className={styles.tagLine}>{preview.tagsLine}</span>
              )}
            </div>
          )}

          {(variant === 'discover' || isSwipe) && (
            <footer className={styles.footer}>
              {job.sourceName && (
                <span className={styles.footerSource}>Source: {job.sourceName}</span>
              )}
              <span className={styles.footerTime}>
                {formatPostedTime(job.createdAt)}
              </span>
            </footer>
          )}

          {footerExtra && (
            <div className={styles.footerExtra}>{footerExtra}</div>
          )}

          {showActions && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.actionGhost}
                onClick={(event) => {
                  event.stopPropagation();
                  onLearnMore?.();
                }}
              >
                Details
              </button>
              {onSave && (
                <button
                  type="button"
                  className={saved ? styles.actionSaved : styles.actionGhost}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSave(event);
                  }}
                >
                  {saved ? 'Saved' : 'Save'}
                </button>
              )}
              <button
                type="button"
                className={styles.actionGhost}
                onClick={(event) => {
                  event.stopPropagation();
                  setShareOpen(true);
                }}
              >
                Share
              </button>
              {onApply && (
                <button
                  type="button"
                  className={applied ? styles.actionDone : styles.actionPrimary}
                  disabled={applied || applying}
                  onClick={(event) => {
                    event.stopPropagation();
                    onApply(event);
                  }}
                >
                  {applied ? 'Applied' : applying ? 'Applying…' : 'Apply'}
                </button>
              )}
            </div>
          )}
        </div>
      </article>

      <JobShareMenu job={job} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
