import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiError } from '@/api/client';
import { applicationsApi } from '@/api/applicationsApi';
import { jobsApi } from '@/api/jobsApi';
import { savedJobsApi } from '@/api/savedJobsApi';
import { tagsApi } from '@/api/tagsApi';
import { SwipeCard, type SwipeDirection } from '@/components/swipe/SwipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { useJobFilters } from '@/hooks/useJobFilters';
import { useProfile } from '@/hooks/useProfile';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import type { Job } from '@/models/job';
import type { Tag } from '@/models/tag';
import styles from './SwipePage.module.css';

export function SwipePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const { trackJobSkip } = useActivityTracking();
  const filters = useJobFilters();

  const [queue, setQueue] = useState<Job[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exit, setExit] = useState<{ jobId: string; direction: SwipeDirection } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fetchPage, setFetchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const skippedRef = useRef<Set<string>>(new Set());
  const pendingActionRef = useRef<{ direction: SwipeDirection; job: Job } | null>(null);

  const loadMore = useCallback(async (page: number, append: boolean) => {
    const result = await jobsApi.search({
      ...filters.query,
      page,
      pageSize: 20,
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
    if (queue.length <= 3 && hasMore && !loading) {
      void loadMore(fetchPage + 1, true);
    }
  }, [queue.length, hasMore, loading, fetchPage, loadMore]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const startSwipe = (direction: SwipeDirection) => {
    const job = queue[0];
    if (!job || exit) return;
    pendingActionRef.current = { direction, job };
    setExit({ jobId: job.id, direction });
  };

  const handleExitComplete = async () => {
    const pending = pendingActionRef.current;
    if (!pending) return;

    const { direction, job } = pending;
    pendingActionRef.current = null;
    setExit(null);

    if (direction === 'left') {
      skippedRef.current.add(job.id);
      void trackJobSkip(job.id);
      showToast('Skipped');
    } else if (direction === 'right') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/swipe' } });
        return;
      }
      try {
        await savedJobsApi.save(job.id);
        showToast('Saved ♥');
      } catch {
        showToast('Could not save');
      }
    } else if (direction === 'up') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/swipe' } });
        return;
      }
      if (!profile) {
        navigate('/profile');
        return;
      }
      try {
        await applicationsApi.apply(job.id);
        showToast('Quick Apply sent ✓');
      } catch (e) {
        if (e instanceof ApiError && e.body && typeof e.body === 'object' && 'error' in e.body) {
          const msg = String((e.body as { error: string }).error);
          showToast(msg);
          if (msg.includes('Profile incomplete') || msg.includes('Profile not found')) {
            navigate('/profile');
          }
        } else {
          showToast('Apply failed');
        }
      }
    }

    setQueue((q) => q.filter((j) => j.id !== job.id));
  };

  const visible = queue.slice(0, 2);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Discover</h1>
          <p className={styles.subtitle}>Swipe to explore jobs</p>
        </div>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setFilterOpen(true)}
        >
          Filters
          {filters.activeFilterCount > 0 && (
            <span className={styles.filterCount}>{filters.activeFilterCount}</span>
          )}
        </button>
      </header>

      <div className={styles.hints}>
        <span>← Skip</span>
        <span>↑ Apply</span>
        <span>Save →</span>
      </div>

      <div className={styles.stack}>
        {loading && queue.length === 0 ? (
          <p className={styles.empty}>Loading jobs...</p>
        ) : queue.length === 0 ? (
          <EmptyState
            icon="⚡"
            title="No jobs in your deck"
            description="You've seen everything matching your filters. Adjust filters or browse the full job list."
            actions={[
              { label: 'Adjust filters', onClick: () => setFilterOpen(true), primary: true },
              { label: 'Browse all jobs', to: '/jobs' },
            ]}
          />
        ) : (
          [...visible].reverse().map((job, i, arr) => {
            const index = arr.length - 1 - i;
            const isTop = index === 0;
            return (
              <SwipeCard
                key={job.id}
                job={job}
                index={index}
                active={isTop}
                exitDirection={exit?.jobId === job.id ? exit.direction : null}
                onSwipe={startSwipe}
                onTap={() => navigate(`/jobs/${job.id}`)}
                onExitComplete={() => void handleExitComplete()}
              />
            );
          })
        )}
      </div>

      {queue.length > 0 && (
        <div className={styles.actions}>
          <motion.button
            type="button"
            className={`${styles.actionBtn} ${styles.skipBtn}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => startSwipe('left')}
            aria-label="Skip"
          >
            ✕
          </motion.button>
          <motion.button
            type="button"
            className={`${styles.actionBtn} ${styles.applyBtn}`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => startSwipe('up')}
            aria-label="Quick Apply"
          >
            ↑
          </motion.button>
          <motion.button
            type="button"
            className={`${styles.actionBtn} ${styles.saveBtn}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => startSwipe('right')}
            aria-label="Save"
          >
            ♥
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {toast}
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
