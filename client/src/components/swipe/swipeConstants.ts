/** Horizontal distance (px) to commit pass / apply on slow drag */
export const SWIPE_THRESHOLD_X = 88;

/** Upward distance (px) to commit save on slow drag */
export const SWIPE_THRESHOLD_Y = 72;

/** Flick velocity (px/s) — fast swipe commits immediately */
export const SWIPE_VELOCITY = 380;

export const SWIPE_EXIT_X = typeof window !== 'undefined' ? window.innerWidth * 1.15 : 640;
export const SWIPE_EXIT_Y = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 520;

export const SWIPE_EXIT = { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };
export const SWIPE_SNAP_BACK = { duration: 0.18, ease: 'easeOut' as const };

export const STACK_LAYERS = 3;

export const STACK_STYLE = [
  { scale: 1, y: 0, opacity: 1 },
  { scale: 0.96, y: 10, opacity: 0.94 },
  { scale: 0.92, y: 20, opacity: 0.88 },
] as const;
