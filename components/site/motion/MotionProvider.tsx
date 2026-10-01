"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Honours the visitor's "reduce motion" setting for every Motion animation on
 * the page: movement (transforms, layout) is dropped, gentle fades remain.
 *
 * The site renders the slim `m` components, and LazyMotion supplies their
 * animation features once here, loaded as a separate chunk after hydration.
 * domMax (not domAnimation) because the header's nav pill uses layoutId.
 * `strict` makes a stray full `motion` component throw in development, so it
 * can't quietly pull the whole feature set back into first load.
 *
 * Import from "framer-motion", not "motion/react": motion's React entry
 * evaluates the full `motion` component at module load, which defeats tree
 * shaking and puts every feature back in the first-load bundle.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
