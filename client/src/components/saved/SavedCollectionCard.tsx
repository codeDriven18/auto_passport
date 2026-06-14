import { motion } from 'framer-motion';
import type { Job } from '@/models/job';
import { IconBookmark } from '@/components/icons/Icons';
import { OpportunityCard } from '@/components/jobs/OpportunityCard';
import styles from './SavedCollectionCard.module.css';

interface SavedCollectionCardProps {
  job: Job;
  savedAt?: string;
  applied?: boolean;
  index?: number;
  onClick?: () => void;
  onUnsave?: (e: React.MouseEvent) => void;
}

function formatSavedDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Saved today';
  if (days === 1) return 'Saved yesterday';
  if (days < 7) return `Saved ${days}d ago`;
  return `Saved ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export function SavedCollectionCard({
  job,
  savedAt,
  applied,
  index = 0,
  onClick,
  onUnsave,
}: SavedCollectionCardProps) {
  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={styles.wrap}
    >
      <OpportunityCard
        job={job}
        variant="compact"
        interactive={false}
        heroBadge={applied ? <span className={styles.appliedBadge}>Applied</span> : undefined}
        heroAction={
          onUnsave && !applied ? (
            <button
              type="button"
              className={styles.unsave}
              onClick={onUnsave}
              aria-label="Remove from collection"
            >
              <IconBookmark size={18} />
            </button>
          ) : undefined
        }
        footerExtra={
          savedAt ? (
            <span className={styles.savedDate}>{formatSavedDate(savedAt)}</span>
          ) : undefined
        }
      />
    </motion.div>
  );
}
