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
