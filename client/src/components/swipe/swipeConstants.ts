/** Horizontal distance (px) to commit pass / apply on slow drag */
export const SWIPE_THRESHOLD_X = 72;

/** Upward distance (px) to commit save on slow drag */
export const SWIPE_THRESHOLD_Y = 64;

/** Flick velocity (px/s) — fast swipe commits immediately */
export const SWIPE_VELOCITY = 320;

export const SWIPE_EXIT_X = typeof window !== 'undefined' ? window.innerWidth * 1.2 : 640;
export const SWIPE_EXIT_Y = typeof window !== 'undefined' ? window.innerHeight * 0.95 : 520;

/** Fast exit — no linger, no snap-back before removal */
export const SWIPE_EXIT = { duration: 0.14, ease: [0.4, 0, 0.2, 1] as const };
export const SWIPE_SNAP_BACK = { duration: 0.16, ease: 'easeOut' as const };

export const STACK_LAYERS = 3;

export const STACK_STYLE = [
  { scale: 1, y: 0, opacity: 1 },
  { scale: 0.965, y: 12, opacity: 0.95 },
  { scale: 0.93, y: 24, opacity: 0.88 },
] as const;

export const SWIPE_ROTATE_RANGE = 12;
