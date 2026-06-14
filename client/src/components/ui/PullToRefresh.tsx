import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type TouchEvent,
} from 'react';
import { IconRefresh } from '@/components/icons/Icons';
import styles from './PullToRefresh.module.css';

const PULL_THRESHOLD = 72;
const MAX_PULL = 112;

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  /** Allow pull even when the page is not scrolled (e.g. swipe deck). */
  allowWithoutScroll?: boolean;
  scrollRef?: RefObject<HTMLElement | null>;
  /** Only start pull when touch begins inside this element. */
  triggerRef?: RefObject<HTMLElement | null>;
}

function readScrollTop(target: HTMLElement | Window | null | undefined): number {
  if (!target) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }
  if (target instanceof Window) {
    return target.scrollY || document.documentElement.scrollTop || 0;
  }
  return target.scrollTop;
}

export function PullToRefresh({
  onRefresh,
  children,
  className = '',
  contentClassName = '',
  disabled = false,
  allowWithoutScroll = false,
  scrollRef,
  triggerRef,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const pullingRef = useRef(false);
  const inFlightRef = useRef(false);

  const getScrollTarget = useCallback((): HTMLElement | Window => {
    return scrollRef?.current ?? window;
  }, [scrollRef]);

  const canStartPull = useCallback(
    (target: EventTarget | null) => {
      if (disabled || refreshing || inFlightRef.current) return false;
      if (triggerRef?.current && target instanceof Node && !triggerRef.current.contains(target)) {
        return false;
      }
      const scrollTop = readScrollTop(getScrollTarget());
      if (scrollTop > 4 && !allowWithoutScroll) return false;
      return true;
    },
    [allowWithoutScroll, disabled, getScrollTarget, refreshing, triggerRef],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!canStartPull(event.target)) return;
      startYRef.current = event.touches[0]?.clientY ?? 0;
      startXRef.current = event.touches[0]?.clientX ?? 0;
      pullingRef.current = true;
    },
    [canStartPull],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!pullingRef.current || refreshing || inFlightRef.current) return;

      const scrollTop = readScrollTop(getScrollTarget());
      if (scrollTop > 4 && !allowWithoutScroll) {
        pullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const currentX = event.touches[0]?.clientX ?? 0;
      const deltaY = currentY - startYRef.current;
      const deltaX = Math.abs(currentX - startXRef.current);

      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      if (deltaY < deltaX * 1.2) return;

      const resisted = Math.min(MAX_PULL, deltaY * 0.45);
      setPullDistance(resisted);

      if (resisted > 12 && event.cancelable) {
        event.preventDefault();
      }
    },
    [allowWithoutScroll, getScrollTarget, refreshing],
  );

  const resetPull = useCallback(() => {
    pullingRef.current = false;
    setPullDistance(0);
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current || refreshing || inFlightRef.current) {
      resetPull();
      return;
    }

    const shouldRefresh = pullDistance >= PULL_THRESHOLD;
    resetPull();

    if (!shouldRefresh) return;

    inFlightRef.current = true;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      inFlightRef.current = false;
      setRefreshing(false);
    }
  }, [onRefresh, pullDistance, resetPull, refreshing]);

  const indicatorVisible = refreshing || pullDistance > 8;
  const indicatorOffset = refreshing ? 0.35 : Math.min(pullDistance * 0.35, 2.5);

  return (
    <div className={`${styles.root} ${className}`}>
      <div
        className={`${styles.indicator} ${indicatorVisible ? styles.indicatorVisible : ''} ${refreshing ? styles.indicatorRefreshing : ''}`}
        style={{ transform: `translateY(${refreshing ? '0.35rem' : `${indicatorOffset - 2}rem`})` }}
        aria-hidden={!indicatorVisible}
      >
        <IconRefresh size={18} className={refreshing ? styles.spinner : undefined} />
      </div>

      <div
        className={`${styles.content} ${pullDistance > 0 && !refreshing ? styles.contentPulling : styles.contentIdle} ${contentClassName}`}
        style={{ transform: refreshing ? 'translateY(2.25rem)' : `translateY(${pullDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => void handleTouchEnd()}
        onTouchCancel={resetPull}
      >
        {children}
      </div>
    </div>
  );
}
