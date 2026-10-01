"use client";

import { m, useScroll, useSpring } from "framer-motion";

/** A thin brand-coloured bar along the top edge that tracks how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 170, damping: 30, restDelta: 0.001 });
  return <m.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
