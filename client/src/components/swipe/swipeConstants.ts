/** Horizontal distance (px) to commit pass / apply on slow drag */
export const SWIPE_THRESHOLD_X = 88;

/** Upward distance (px) to commit save on slow drag */
export const SWIPE_THRESHOLD_Y = 72;

/** Flick velocity (px/s) — fast swipe commits immediately */
export const SWIPE_VELOCITY = 380;

export const SWIPE_EXIT_X = typeof window !== 'undefined' ? window.innerWidth * 1.15 : 640;
export const SWIPE_EXIT_Y = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 520;

export const SWIPE_SPRING = {
  stiff: { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.85 },
  soft: { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.9 },
  snapBack: { type: 'spring' as const, stiffness: 540, damping: 38, mass: 0.75 },
  promote: { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.8 },
};

export const STACK_LAYERS = 3;

export const STACK_STYLE = [
  { scale: 1, y: 0, opacity: 1 },
  { scale: 0.94, y: 14, opacity: 0.92 },
  { scale: 0.88, y: 28, opacity: 0.84 },
] as const;
