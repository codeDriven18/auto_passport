import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ApiError } from '@/api/client';
import { applicationsApi } from '@/api/applicationsApi';
import { jobsApi } from '@/api/jobsApi';
import { savedJobsApi } from '@/api/savedJobsApi';
import { tagsApi } from '@/api/tagsApi';
import {
  PremiumSwipeDeck,
  type PremiumSwipeDeckHandle,
  type SwipeDirection,
} from '@/components/swipe/PremiumSwipeDeck';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { useAuth } from '@/context/AuthContext';
import { useJobFilters } from '@/hooks/useJobFilters';
import { useProfile } from '@/hooks/useProfile';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import type { Job } from '@/models/job';
import type { Tag } from '@/models/tag';
import styles from './SwipePage.module.css';

const STACK_BUFFER = 3;

export function SwipePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const { trackJobSkip } = useActivityTracking();
  const filters = useJobFilters();
  const deckRef = useRef<PremiumSwipeDeckHandle>(null);

  const [queue, setQueue] = useState<Job[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'neutral' | 'success' | 'error' } | null>(null);
  const [fetchPage, setFetchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const skippedRef = useRef<Set<string>>(new Set());

  const loadMore = useCallback(async (page: number, append: boolean) => {
    const result = await jobsApi.search({
      ...filters.query,
      page,
      pageSize: 24,
    });
    const fresh = result.items.filter((j) => !skippedRef.current.has(j.id));
    setQueue((prev) => (append ? [...prev, ...fresh] : fresh));
    setHasMore(page < result.totalPages);
    setFetchPage(page);
  }, [filters.query]);

  useEffect(() => {
    setLoading(true);
    skippedRef.current.clear();
    setQueue([]);
    loadMore(1, false).finally(() => setLoading(false));
  }, [loadMore]);

  useEffect(() => {
    tagsApi.getAll().then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (queue.length <= STACK_BUFFER + 2 && hasMore && !loading) {
      void loadMore(fetchPage + 1, true);
    }
  }, [queue.length, hasMore, loading, fetchPage, loadMore]);

  const showToast = (msg: string, tone: 'neutral' | 'success' | 'error' = 'neutral') => {
    setToast({ msg, tone });
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleDismiss = useCallback(async (job: Job, direction: SwipeDirection) => {
    setQueue((q) => q.filter((j) => j.id !== job.id));

    if (direction === 'pass') {
      skippedRef.current.add(job.id);
      void trackJobSkip(job.id);
      showToast('Passed');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/swipe' } });
      return;
    }

    if (direction === 'save') {
      try {
        await savedJobsApi.save(job.id);
        showToast('Saved to your collection', 'success');
      } catch {
        showToast('Could not save', 'error');
      }
      return;
    }

    if (!profile) {
      navigate('/profile');
      return;
    }

    try {
      await applicationsApi.apply(job.id);
      showToast('Application sent!', 'success');
    } catch (e) {
      if (e instanceof ApiError && e.body && typeof e.body === 'object' && 'error' in e.body) {
        const msg = String((e.body as { error: string }).error);
        showToast(msg, 'error');
        if (msg.includes('Profile incomplete') || msg.includes('Profile not found')) {
          navigate('/profile');
        }
      } else {
        showToast('Apply failed', 'error');
      }
    }
  }, [isAuthenticated, navigate, profile, trackJobSkip]);

  return (
    <section className={styles.page}>
      <div className={styles.backdrop} aria-hidden />

      <header className={styles.header}>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setFilterOpen(true)}
          aria-label="Filters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          {filters.activeFilterCount > 0 && (
            <span className={styles.filterCount}>{filters.activeFilterCount}</span>
          )}
        </button>
        <span className={styles.deckCount}>
          {loading ? '…' : `${queue.length} left`}
        </span>
      </header>

      <div className={styles.stage}>
        {loading && queue.length === 0 ? (
          <Skeleton variant="swipeCard" className={styles.skeletonCard} />
        ) : queue.length === 0 ? (
          <EmptyState
            illustration="swipe"
            title="You're all caught up"
            description="Adjust filters or browse collections to keep discovering roles."
            actions={[
              { label: 'Adjust filters', onClick: () => setFilterOpen(true), primary: true },
              { label: 'Browse Discover', to: '/jobs' },
            ]}
          />
        ) : (
          <PremiumSwipeDeck
            ref={deckRef}
            jobs={queue}
            onDismiss={(job, direction) => void handleDismiss(job, direction)}
            onTap={(job) => navigate(`/jobs/${job.id}`)}
          />
        )}
      </div>

      {queue.length > 0 && (
        <div className={styles.dock}>
          <motion.button
            type="button"
            className={`${styles.dockBtn} ${styles.passBtn}`}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => deckRef.current?.dismiss('pass')}
            aria-label="Pass"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </motion.button>
          <motion.button
            type="button"
            className={`${styles.dockBtn} ${styles.saveBtn}`}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => deckRef.current?.dismiss('save')}
            aria-label="Save"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          <motion.button
            type="button"
            className={`${styles.dockBtn} ${styles.applyBtn}`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => deckRef.current?.dismiss('apply')}
            aria-label="Apply"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${styles[`toast_${toast.tone}`]}`}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        tags={tags}
        category={filters.category}
        city={filters.city}
        isRemote={filters.isRemote}
        salaryMin={filters.salaryMin}
        selectedTags={filters.selectedTags}
        onApply={(f) => {
          filters.updateParams({
            category: f.category,
            city: f.city || null,
            isRemote: f.isRemote,
            salaryMin: f.salaryMin || null,
            tags: f.selectedTags || null,
            page: '1',
          });
        }}
      />
    </section>
  );
}
