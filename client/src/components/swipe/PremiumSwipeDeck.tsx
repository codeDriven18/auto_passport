import {
  forwardRef,
  useCallback,
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
import { SwipeJobCardContent } from './SwipeJobCardContent';
import {
  STACK_LAYERS,
  STACK_STYLE,
  SWIPE_EXIT,
  SWIPE_EXIT_X,
  SWIPE_EXIT_Y,
  SWIPE_SNAP_BACK,
  SWIPE_THRESHOLD_X,
  SWIPE_THRESHOLD_Y,
  SWIPE_VELOCITY,
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

function resolveDirection(
  offset: { x: number; y: number },
  velocity: { x: number; y: number },
): SwipeDirection | null {
  const absX = Math.abs(offset.x);
  const absY = Math.abs(offset.y);

  if ((offset.y < -SWIPE_THRESHOLD_Y || velocity.y < -SWIPE_VELOCITY) && absY >= absX) {
    return 'save';
  }
  if (offset.x < -SWIPE_THRESHOLD_X || velocity.x < -SWIPE_VELOCITY) {
    return 'pass';
  }
  if (offset.x > SWIPE_THRESHOLD_X || velocity.x > SWIPE_VELOCITY) {
    return 'apply';
  }
  return null;
}

export const PremiumSwipeDeck = forwardRef<PremiumSwipeDeckHandle, PremiumSwipeDeckProps>(
  function PremiumSwipeDeck({ jobs, onDismiss, onTap }, ref) {
    const topJob = jobs[0];
    const stackJobs = jobs.slice(0, STACK_LAYERS);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const passOpacity = useTransform(x, [-140, -40, 0], [1, 0.5, 0]);
    const applyOpacity = useTransform(x, [0, 40, 140], [0, 0.5, 1]);
    const saveOpacity = useTransform(y, [0, -40, -120], [0, 0.5, 1]);

    const [isExiting, setIsExiting] = useState(false);
    const exitingRef = useRef(false);
    const topJobRef = useRef(topJob);
    topJobRef.current = topJob;

    const flyOut = useCallback(async (
      direction: SwipeDirection,
      velocity: { x: number; y: number },
    ) => {
      if (exitingRef.current || !topJobRef.current) return;
      exitingRef.current = true;
      setIsExiting(true);

      x.stop();
      y.stop();

      const exitX = typeof window !== 'undefined' ? window.innerWidth * 1.15 : SWIPE_EXIT_X;
      const exitY = typeof window !== 'undefined' ? window.innerHeight * 0.9 : SWIPE_EXIT_Y;

      if (direction === 'pass') {
        await animate(x, -exitX, { ...SWIPE_EXIT, velocity: velocity.x });
      } else if (direction === 'apply') {
        await animate(x, exitX, { ...SWIPE_EXIT, velocity: velocity.x });
      } else {
        await animate(y, -exitY, { ...SWIPE_EXIT, velocity: velocity.y });
      }

      const job = topJobRef.current;
      exitingRef.current = false;
      setIsExiting(false);
      if (job) onDismiss(job, direction);
    }, [onDismiss, x, y]);

    useImperativeHandle(ref, () => ({
      dismiss: (direction: SwipeDirection) => {
        const velocity = {
          x: direction === 'pass' ? -SWIPE_VELOCITY : direction === 'apply' ? SWIPE_VELOCITY : 0,
          y: direction === 'save' ? -SWIPE_VELOCITY : 0,
        };
        void flyOut(direction, velocity);
      },
    }), [flyOut]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (exitingRef.current) return;

      const direction = resolveDirection(info.offset, info.velocity);
      if (direction) {
        void flyOut(direction, info.velocity);
        return;
      }

      void Promise.all([
        animate(x, 0, SWIPE_SNAP_BACK),
        animate(y, 0, SWIPE_SNAP_BACK),
      ]);

      if (Math.abs(info.offset.x) < 10 && Math.abs(info.offset.y) < 10 && topJobRef.current) {
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
                transform: `translateY(${layer.y}px) scale(${layer.scale})`,
                opacity: layer.opacity,
              }}
            >
              <div className={styles.stackCardInner}>
                <SwipeJobCardContent job={job} />
              </div>
            </div>
          );
        })}

        {topJob && (
          <motion.article
            key={topJob.id}
            className={styles.topCard}
            style={{ x, y, zIndex: 20 }}
            drag={!isExiting}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {!isExiting && (
              <>
                <motion.span
                  className={`${styles.stamp} ${styles.stampPass}`}
                  style={{ opacity: passOpacity }}
                >
                  PASS
                </motion.span>
                <motion.span
                  className={`${styles.stamp} ${styles.stampApply}`}
                  style={{ opacity: applyOpacity }}
                >
                  APPLY
                </motion.span>
                <motion.span
                  className={`${styles.stamp} ${styles.stampSave}`}
                  style={{ opacity: saveOpacity }}
                >
                  SAVE
                </motion.span>
              </>
            )}
            <SwipeJobCardContent job={topJob} />
          </motion.article>
        )}
      </div>
    );
  },
);
