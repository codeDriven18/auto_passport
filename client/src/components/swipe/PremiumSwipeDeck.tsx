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
import { OpportunityCard } from '@/components/jobs/OpportunityCard';
import {
  STACK_LAYERS,
  STACK_STYLE,
  SWIPE_EXIT,
  SWIPE_EXIT_X,
  SWIPE_EXIT_Y,
  SWIPE_ROTATE_RANGE,
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
  const absVx = Math.abs(velocity.x);
  const absVy = Math.abs(velocity.y);

  const flickUp = velocity.y < -SWIPE_VELOCITY && absVy >= absVx;
  const flickLeft = velocity.x < -SWIPE_VELOCITY && absVx >= absVy;
  const flickRight = velocity.x > SWIPE_VELOCITY && absVx >= absVy;

  if ((offset.y < -SWIPE_THRESHOLD_Y || flickUp) && absY >= absX * 0.65) {
    return 'save';
  }
  if (offset.x < -SWIPE_THRESHOLD_X || flickLeft) {
    return 'pass';
  }
  if (offset.x > SWIPE_THRESHOLD_X || flickRight) {
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
    const rotate = useTransform(x, [-180, 0, 180], [-SWIPE_ROTATE_RANGE, 0, SWIPE_ROTATE_RANGE]);
    const shadow = useTransform(x, (v) => {
      const lift = 8 + Math.min(Math.abs(v) * 0.04, 16);
      return `0 ${lift}px ${20 + Math.min(Math.abs(v) * 0.08, 24)}px rgba(0,0,0,0.14)`;
    });

    const passOpacity = useTransform(x, [-120, -36, 0], [1, 0.45, 0]);
    const applyOpacity = useTransform(x, [0, 36, 120], [0, 0.45, 1]);
    const saveOpacity = useTransform(y, [0, -36, -110], [0, 0.45, 1]);

    const [isExiting, setIsExiting] = useState(false);
    const exitingRef = useRef(false);
    const topJobRef = useRef(topJob);
    topJobRef.current = topJob;

    useEffect(() => {
      if (exitingRef.current) return;
      x.set(0);
      y.set(0);
    }, [topJob?.id, x, y]);

    const flyOut = useCallback((
      direction: SwipeDirection,
      velocity: { x: number; y: number },
    ) => {
      if (exitingRef.current || !topJobRef.current) return;
      exitingRef.current = true;
      setIsExiting(true);

      x.stop();
      y.stop();

      const exitX = typeof window !== 'undefined' ? window.innerWidth * 1.2 : SWIPE_EXIT_X;
      const exitY = typeof window !== 'undefined' ? window.innerHeight * 0.95 : SWIPE_EXIT_Y;
      const job = topJobRef.current;

      const finish = () => {
        exitingRef.current = false;
        setIsExiting(false);
        x.set(0);
        y.set(0);
        if (job) onDismiss(job, direction);
      };

      if (direction === 'pass') {
        void animate(x, -exitX, { ...SWIPE_EXIT, velocity: velocity.x }).then(finish);
      } else if (direction === 'apply') {
        void animate(x, exitX, { ...SWIPE_EXIT, velocity: velocity.x }).then(finish);
      } else {
        void animate(y, -exitY, { ...SWIPE_EXIT, velocity: velocity.y }).then(finish);
      }
    }, [onDismiss, x, y]);

    useImperativeHandle(ref, () => ({
      dismiss: (direction: SwipeDirection) => {
        flyOut(direction, {
          x: direction === 'pass' ? -SWIPE_VELOCITY : direction === 'apply' ? SWIPE_VELOCITY : 0,
          y: direction === 'save' ? -SWIPE_VELOCITY : 0,
        });
      },
    }), [flyOut]);

    const tryCommit = useCallback((info: PanInfo) => {
      const direction = resolveDirection(info.offset, info.velocity);
      if (direction) flyOut(direction, info.velocity);
    }, [flyOut]);

    const handleDrag = (_: unknown, info: PanInfo) => {
      if (exitingRef.current) return;
      tryCommit(info);
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (exitingRef.current) return;

      const direction = resolveDirection(info.offset, info.velocity);
      if (direction) {
        flyOut(direction, info.velocity);
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
              <OpportunityCard job={job} variant="swipe" interactive={false} />
            </div>
          );
        })}

        {topJob && (
          <motion.article
            key={topJob.id}
            className={styles.topCard}
            style={{ x, y, rotate, boxShadow: shadow, zIndex: 20 }}
            drag={!isExiting}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
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
            <OpportunityCard job={topJob} variant="swipe" interactive={false} />
          </motion.article>
        )}
      </div>
    );
  },
);
