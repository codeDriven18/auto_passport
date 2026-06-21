import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import type { Job } from '@/models/job';
import { SwipeJobCard } from '@/components/jobs/SwipeJobCard';
import { IconHeart, IconX } from '@/components/icons/Icons';
import {
  STACK_LAYERS,
  STACK_STYLE,
  SWIPE_EXIT,
  SWIPE_EXIT_X,
  SWIPE_EXIT_Y,
  SWIPE_ROTATE_RANGE,
  SWIPE_SNAP_BACK,
  SWIPE_TAP_SLOP,
  SWIPE_THRESHOLD_X,
  SWIPE_THRESHOLD_Y,
} from './swipeConstants';
import styles from './PremiumSwipeDeck.module.css';

export type SwipeDirection = 'pass' | 'apply' | 'save';

export interface PremiumSwipeDeckHandle {
  dismiss: (direction: SwipeDirection) => void;
}

interface PremiumSwipeDeckProps {
  jobs: Job[];
  onDismiss: (job: Job, direction: SwipeDirection) => void;
  onTap: (job: Job) => void;
}

interface ExitState {
  job: Job;
  direction: SwipeDirection;
}

/** Position-only threshold — speed does not affect commit. */
function resolveDirection(offset: { x: number; y: number }): SwipeDirection | null {
  const absX = Math.abs(offset.x);
  const absY = Math.abs(offset.y);

  if (offset.y <= -SWIPE_THRESHOLD_Y && absY > absX) return 'save';
  if (offset.x <= -SWIPE_THRESHOLD_X && absX >= absY) return 'pass';
  if (offset.x >= SWIPE_THRESHOLD_X && absX >= absY) return 'apply';
  return null;
}

function exitTarget(direction: SwipeDirection) {
  if (direction === 'pass') return { x: -SWIPE_EXIT_X, y: 0, rotate: -SWIPE_ROTATE_RANGE };
  if (direction === 'apply') return { x: SWIPE_EXIT_X, y: 0, rotate: SWIPE_ROTATE_RANGE };
  return { x: 0, y: -SWIPE_EXIT_Y, rotate: 0 };
}

export const PremiumSwipeDeck = forwardRef<PremiumSwipeDeckHandle, PremiumSwipeDeckProps>(
  function PremiumSwipeDeck({ jobs, onDismiss, onTap }, ref) {
    const topJob = jobs[0];
    const stackJobs = jobs.slice(0, STACK_LAYERS);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-SWIPE_ROTATE_RANGE, 0, SWIPE_ROTATE_RANGE]);

    const passOpacity = useTransform(x, [-SWIPE_THRESHOLD_X, -24, 0], [1, 0.35, 0]);
    const applyOpacity = useTransform(x, [0, 24, SWIPE_THRESHOLD_X], [0, 0.35, 1]);
    const saveOpacity = useTransform(y, [0, -24, -SWIPE_THRESHOLD_Y], [0, 0.35, 1]);

    const [exitState, setExitState] = useState<ExitState | null>(null);
    const exitLockedRef = useRef(false);
    const draggedRef = useRef(false);
    const topJobRef = useRef(topJob);
    topJobRef.current = topJob;

    useEffect(() => {
      if (exitLockedRef.current) return;
      x.set(0);
      y.set(0);
      draggedRef.current = false;
    }, [topJob?.id, x, y]);

    const finishExit = useCallback(() => {
      exitLockedRef.current = false;
      setExitState(null);
    }, []);

    const flyOut = useCallback((direction: SwipeDirection) => {
      if (exitLockedRef.current || !topJobRef.current) return;
      const job = topJobRef.current;

      exitLockedRef.current = true;
      x.stop();
      y.stop();
      x.set(0);
      y.set(0);

      onDismiss(job, direction);
      setExitState({ job, direction });
    }, [onDismiss, x, y]);

    useImperativeHandle(ref, () => ({
      dismiss: (direction: SwipeDirection) => flyOut(direction),
    }), [flyOut]);

    const handleDragStart = () => {
      draggedRef.current = false;
    };

    const handleDrag = (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > SWIPE_TAP_SLOP || Math.abs(info.offset.y) > SWIPE_TAP_SLOP) {
        draggedRef.current = true;
      }
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (exitLockedRef.current) return;

      const direction = resolveDirection(info.offset);
      if (direction) {
        flyOut(direction);
        return;
      }

      void Promise.all([
        animate(x, 0, SWIPE_SNAP_BACK),
        animate(y, 0, SWIPE_SNAP_BACK),
      ]);

      if (!draggedRef.current && topJobRef.current) {
        onTap(topJobRef.current);
      }
    };

    return (
      <div className={styles.deck}>
        {stackJobs.slice(1).reverse().map((job, reverseIndex) => {
          const layerIndex = stackJobs.length - 1 - reverseIndex;
          const layer = STACK_STYLE[layerIndex] ?? STACK_STYLE[2];
          return (
            <div
              key={job.id}
              className={styles.stackCard}
              style={{
                zIndex: 10 - layerIndex,
                transform: `translateY(${layer.y}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
                opacity: layer.opacity,
              }}
            >
              <SwipeJobCard job={job} interactive={false} />
            </div>
          );
        })}

        {topJob && !exitState && (
          <motion.div
            key={topJob.id}
            className={styles.topCard}
            style={{ x, y, rotate, zIndex: 20 }}
            drag={!exitLockedRef.current}
            dragElastic={0}
            dragMomentum={false}
            dragPropagation={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className={styles.passOverlay}
              style={{ opacity: passOpacity }}
              aria-hidden
            />
            <motion.div
              className={styles.applyOverlay}
              style={{ opacity: applyOpacity }}
              aria-hidden
            />
            <motion.div
              className={`${styles.stamp} ${styles.stampPass}`}
              style={{ opacity: passOpacity }}
            >
              <IconX size={28} />
              <span>SKIP</span>
            </motion.div>
            <motion.div
              className={`${styles.stamp} ${styles.stampApply}`}
              style={{ opacity: applyOpacity }}
            >
              <IconHeart size={28} />
              <span>APPLY</span>
            </motion.div>
            <motion.span
              className={`${styles.stamp} ${styles.stampSave}`}
              style={{ opacity: saveOpacity }}
            >
              SAVE
            </motion.span>
            <SwipeJobCard job={topJob} interactive dragX={x} dragY={y} />
          </motion.div>
        )}

        {exitState && (
          <motion.div
            key={`exit-${exitState.job.id}`}
            className={styles.topCard}
            style={{ zIndex: 30, pointerEvents: 'none' }}
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={exitTarget(exitState.direction)}
            transition={SWIPE_EXIT}
            onAnimationComplete={finishExit}
          >
            <SwipeJobCard job={exitState.job} interactive={false} />
          </motion.div>
        )}
      </div>
    );
  },
);
