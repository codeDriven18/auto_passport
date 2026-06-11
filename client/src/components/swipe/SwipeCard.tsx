import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { Job } from '@/models/job';
import { JobCategoryLabels, JobLevelLabels } from '@/models/enums';
import { formatSalary, truncateText } from '@/lib/jobFormat';
import { CompanyLink } from '@/components/jobs/CompanyLink';
import { TrendingBadges } from '@/components/ui/TrendingBadge';
import styles from './SwipeCard.module.css';

export type SwipeDirection = 'left' | 'right' | 'up';

const SWIPE_X = 100;
const SWIPE_Y = -90;
const VELOCITY = 450;

const EXIT_X = 520;
const EXIT_Y = -520;

const EXIT_SPRING = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.85 };
const RETURN_SPRING = { type: 'spring' as const, stiffness: 520, damping: 38 };

interface SwipeCardProps {
  job: Job;
  active: boolean;
  exitDirection: SwipeDirection | null;
  onSwipe: (direction: SwipeDirection) => void;
  onTap: () => void;
  onExitComplete: () => void;
  index: number;
}

export function SwipeCard({
  job,
  active,
  exitDirection,
  onSwipe,
  onTap,
  onExitComplete,
  index,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const skipOpacity = useTransform(x, [-120, -40, 0], [1, 0.3, 0]);
  const saveOpacity = useTransform(x, [0, 40, 120], [0, 0.3, 1]);
  const applyOpacity = useTransform(y, [-100, -30, 0], [1, 0.3, 0]);

  const [isFlying, setIsFlying] = useState(false);
  const exitStarted = useRef(false);
  const wasActive = useRef(active);

  const scale = 1 - index * 0.05;
  const yOffset = index * 10;

  const runExitAnimation = async (direction: SwipeDirection) => {
    x.stop();
    y.stop();

    const opacityAnim = animate(opacity, 0, { duration: 0.2, ease: 'easeOut' });
    const moveAnim =
      direction === 'left'
        ? animate(x, -EXIT_X, EXIT_SPRING)
        : direction === 'right'
          ? animate(x, EXIT_X, EXIT_SPRING)
          : animate(y, EXIT_Y, EXIT_SPRING);

    await Promise.all([opacityAnim, moveAnim]);
    onExitComplete();
  };

  const beginExit = (direction: SwipeDirection) => {
    if (exitStarted.current) return;
    exitStarted.current = true;
    setIsFlying(true);
    void runExitAnimation(direction);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (exitStarted.current) return;

    const { offset, velocity } = info;

    let direction: SwipeDirection | null = null;
    if (offset.y < SWIPE_Y || velocity.y < -VELOCITY) direction = 'up';
    else if (offset.x > SWIPE_X || velocity.x > VELOCITY) direction = 'right';
    else if (offset.x < -SWIPE_X || velocity.x < -VELOCITY) direction = 'left';

    if (direction) {
      onSwipe(direction);
      beginExit(direction);
      return;
    }

    void Promise.all([
      animate(x, 0, RETURN_SPRING),
      animate(y, 0, RETURN_SPRING),
    ]);

    if (Math.abs(offset.x) < 10 && Math.abs(offset.y) < 10) {
      onTap();
    }
  };

  // Action-button swipes (no drag) — parent sets exitDirection
  useEffect(() => {
    if (!exitDirection || !active || exitStarted.current) return;
    beginExit(exitDirection);
  }, [exitDirection, active]);

  // Promote back card to top when index becomes 0
  useEffect(() => {
    if (active && !wasActive.current && !exitStarted.current) {
      y.set(yOffset);
      void animate(y, 0, { type: 'spring', stiffness: 420, damping: 34 });
    }
    wasActive.current = active;
  }, [active, yOffset, y]);

  const usesMotionPosition = active || isFlying;

  return (
    <motion.article
      className={styles.card}
      style={{
        x: usesMotionPosition ? x : 0,
        y: usesMotionPosition ? y : yOffset,
        rotate: usesMotionPosition ? rotate : 0,
        opacity,
        scale,
        zIndex: 10 - index,
      }}
      drag={active && !isFlying}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={active && !isFlying ? handleDragEnd : undefined}
    >
      {active && !isFlying && (
        <>
          <motion.span className={`${styles.stamp} ${styles.stampSkip}`} style={{ opacity: skipOpacity }}>
            SKIP
          </motion.span>
          <motion.span className={`${styles.stamp} ${styles.stampSave}`} style={{ opacity: saveOpacity }}>
            SAVE
          </motion.span>
          <motion.span className={`${styles.stamp} ${styles.stampApply}`} style={{ opacity: applyOpacity }}>
            APPLY
          </motion.span>
        </>
      )}

      <div className={styles.top}>
        <span className={styles.categoryBadge}>{JobCategoryLabels[job.category]}</span>
        {job.isRemote && <span className={styles.remoteBadge}>Remote</span>}
        {job.level > 0 && (
          <span className={styles.levelBadge}>{JobLevelLabels[job.level]}</span>
        )}
      </div>

      <TrendingBadges badges={job.trendingBadges} />

      <h2 className={styles.title}>{job.title}</h2>
      <CompanyLink name={job.company} slug={job.companySlug} className={styles.company} />

      <div className={styles.salaryBlock}>
        <span className={styles.salaryLabel}>Compensation</span>
        <span className={styles.salary}>{formatSalary(job.salaryMin, job.salaryMax, job.category, job.externalUrl)}</span>
      </div>

      <p className={styles.location}>{job.city ?? job.location ?? 'Flexible location'}</p>
      <p className={styles.description}>{truncateText(job.description, 160)}</p>

      {job.tags.length > 0 && (
        <div className={styles.tags}>
          {job.tags.slice(0, 4).map((t) => (
            <span key={t.id} className={styles.tag}>{t.name}</span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
