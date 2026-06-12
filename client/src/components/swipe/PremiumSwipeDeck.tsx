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
  SWIPE_EXIT_X,
  SWIPE_EXIT_Y,
  SWIPE_SPRING,
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
  onDragProgress?: (intensity: number) => void;
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
  function PremiumSwipeDeck({ jobs, onDismiss, onTap, onDragProgress }, ref) {
    const topJob = jobs[0];
    const stackJobs = jobs.slice(0, STACK_LAYERS);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);
    const rotate = useTransform(x, [-240, 0, 240], [-16, 0, 16]);
    const boxShadow = useTransform(x, (v) => {
      const lift = 12 + Math.min(Math.abs(v) * 0.06, 28);
      const blur = 24 + Math.min(Math.abs(v) * 0.12, 40);
      return `0 ${lift}px ${blur}px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)`;
    });

    const passOpacity = useTransform(x, [-160, -48, 0], [1, 0.45, 0]);
    const passScale = useTransform(x, [-160, -48, 0], [1.08, 0.96, 0.82]);
    const applyOpacity = useTransform(x, [0, 48, 160], [0, 0.45, 1]);
    const applyScale = useTransform(x, [0, 48, 160], [0.82, 0.96, 1.08]);
    const saveOpacity = useTransform(y, [0, -48, -140], [0, 0.45, 1]);
    const saveScale = useTransform(y, [0, -48, -140], [0.82, 0.96, 1.08]);

    const [isExiting, setIsExiting] = useState(false);
    const [dragBoost, setDragBoost] = useState(0);
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
      setDragBoost(0);
      onDragProgress?.(0);

      x.stop();
      y.stop();
      scale.stop();

      const exitX = typeof window !== 'undefined' ? window.innerWidth * 1.15 : SWIPE_EXIT_X;
      const exitY = typeof window !== 'undefined' ? window.innerHeight * 0.9 : SWIPE_EXIT_Y;

      if (direction === 'pass') {
        await animate(x, -exitX, { ...SWIPE_SPRING.stiff, velocity: velocity.x });
      } else if (direction === 'apply') {
        await animate(x, exitX, { ...SWIPE_SPRING.stiff, velocity: velocity.x });
      } else {
        await Promise.all([
          animate(y, -exitY, { ...SWIPE_SPRING.stiff, velocity: velocity.y }),
          animate(scale, 0.94, { duration: 0.2 }),
        ]);
      }

      const job = topJobRef.current;
      exitingRef.current = false;
      setIsExiting(false);
      if (job) onDismiss(job, direction);
    }, [onDismiss, onDragProgress, scale, x, y]);

    useImperativeHandle(ref, () => ({
      dismiss: (direction: SwipeDirection) => {
        const velocity = {
          x: direction === 'pass' ? -SWIPE_VELOCITY : direction === 'apply' ? SWIPE_VELOCITY : 0,
          y: direction === 'save' ? -SWIPE_VELOCITY : 0,
        };
        void flyOut(direction, velocity);
      },
    }), [flyOut]);

    const handleDrag = (_: unknown, info: PanInfo) => {
      if (exitingRef.current) return;
      const drag = Math.max(Math.abs(info.offset.x), Math.abs(info.offset.y));
      const intensity = Math.min(1, drag / 180);
      setDragBoost(intensity);
      onDragProgress?.(intensity);
      scale.set(1 + Math.min(drag * 0.0007, 0.045));
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (exitingRef.current) return;

      const direction = resolveDirection(info.offset, info.velocity);
      if (direction) {
        void flyOut(direction, info.velocity);
        return;
      }

      setDragBoost(0);
      onDragProgress?.(0);
      void animate(scale, 1, SWIPE_SPRING.snapBack);
      void Promise.all([
        animate(x, 0, SWIPE_SPRING.snapBack),
        animate(y, 0, SWIPE_SPRING.snapBack),
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
          const boost = dragBoost * 0.05;
          return (
            <motion.div
              key={job.id}
              className={styles.stackCard}
              initial={false}
              animate={{
                scale: layer.scale + boost,
                y: layer.y - dragBoost * 10,
                opacity: layer.opacity + dragBoost * 0.08,
              }}
              transition={SWIPE_SPRING.promote}
              style={{ zIndex: 10 - layerIndex }}
            >
              <div className={styles.stackCardInner}>
                <SwipeJobCardContent job={job} />
              </div>
            </motion.div>
          );
        })}

        {topJob && (
          <motion.article
            key={topJob.id}
            className={styles.topCard}
            style={{ x, y, rotate, scale, boxShadow, zIndex: 20 }}
            drag={!isExiting}
            dragElastic={0.08}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {!isExiting && (
              <>
                <motion.span
                  className={`${styles.stamp} ${styles.stampPass}`}
                  style={{ opacity: passOpacity, scale: passScale }}
                >
                  PASS
                </motion.span>
                <motion.span
                  className={`${styles.stamp} ${styles.stampApply}`}
                  style={{ opacity: applyOpacity, scale: applyScale }}
                >
                  APPLY
                </motion.span>
                <motion.span
                  className={`${styles.stamp} ${styles.stampSave}`}
                  style={{ opacity: saveOpacity, scale: saveScale }}
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
