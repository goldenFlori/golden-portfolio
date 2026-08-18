/** Shared animation presets so entrance motion stays consistent site-wide. */

/** Fade-and-rise entrance, staggered by an explicit delay in seconds. */
export const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const, delay },
});

/** Slide-in for the nth item of a list; items appear one after another. */
export const listItem = (index: number) => ({
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: "easeOut" as const, delay: index * 0.05 },
});

/**
 * Hover/tap lift for large surfaces (cards). Each target carries its own
 * `transition` so this can be spread alongside `rise(delay)` on the same
 * element without the two colliding on a shared top-level `transition` key.
 */
export const hoverLift = {
  whileHover: { y: -3, transition: { duration: 0.2, ease: "easeOut" as const } },
  whileTap: { y: 0, transition: { duration: 0.1, ease: "easeOut" as const } },
};

/** Scale feedback for small pressable elements (buttons, chips). */
export const pressable = {
  whileHover: { scale: 1.03, transition: { duration: 0.15, ease: "easeOut" as const } },
  whileTap: { scale: 0.97, transition: { duration: 0.1, ease: "easeOut" as const } },
};
