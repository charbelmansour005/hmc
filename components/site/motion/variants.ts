// Shared Motion variants. Plain objects only — deliberately no "use client" —
// so server components can hand them straight to motion/react-client elements.
// Parents reveal with initial="hidden" whileInView="show"; children inherit the
// labels, and cards additionally pass "hover" down to their image.
import type { Transition, Variants } from "motion/react";

/** Expo-style ease-out used across the site (matches --ease-out in site.css). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Near-critically damped: settles softly without a visible bounce. */
const SETTLE: Transition = { type: "spring", stiffness: 120, damping: 20, mass: 0.9 };

/** Reveal once, shortly before an element reaches the bottom of the screen. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { y: SETTLE, opacity: { duration: 0.7, ease: EASE_OUT } } },
};

/** Slides in from the side the text starts on: the left, or the right in Arabic. */
export function slideIn(dir: "ltr" | "rtl" = "ltr"): Variants {
  return {
    hidden: { opacity: 0, x: dir === "rtl" ? 16 : -16 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
  };
}

/** Parent that releases its children one after another. */
export function cascade(staggerChildren = 0.08, delayChildren = 0): Variants {
  return { hidden: {}, show: { transition: { staggerChildren, delayChildren } } };
}

/** Small badges (step numbers, check marks) spring into place. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotate: -40 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 320, damping: 15, delay: 0.15 },
  },
};

/** An SVG stroke that draws itself in. */
export const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeInOut", delay: 0.35 },
      opacity: { duration: 0.01, delay: 0.35 },
    },
  },
};

/**
 * Cards (service, feature, clinic, step, team): each card fades up on its own
 * as it scrolls into view, rather than the whole grid at once. `custom` is the
 * card's stagger delay in seconds (its column within the row, see
 * useCardReveal), and children are held back by the same amount.
 */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delayChildren: delay,
      opacity: { duration: 0.75, ease: EASE_OUT, delay },
      scale: { duration: 0.75, ease: EASE_OUT, delay },
      y: { ...SETTLE, delay },
    },
  }),
  hover: { y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } },
};

/** Card image: inherits "hover" from the card and zooms in on a spring. */
export const zoom: Variants = {
  hidden: { scale: 1 },
  show: { scale: 1, transition: { type: "spring", stiffness: 170, damping: 22 } },
  hover: { scale: 1.09, transition: { type: "spring", stiffness: 170, damping: 20 } },
};
