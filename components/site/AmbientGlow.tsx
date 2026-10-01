"use client";

import { motion, type Transition } from "motion/react";
import { Aurora } from "./Aurora";

const drift = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

/** The previous drifting CSS glows, kept as the fallback when WebGL is unavailable. */
function GlowOrbs() {
  return (
    <div className="glow-orbs">
      <motion.span
        className="glow-orb glow-orb--teal"
        animate={{ x: [0, 80, -30], y: [0, 50, 110], scale: [1, 1.12, 0.94] }}
        transition={drift(22)}
      />
      <motion.span
        className="glow-orb glow-orb--blue"
        animate={{ x: [0, -90, 30], y: [0, 70, -10], scale: [1, 0.92, 1.1] }}
        transition={drift(26, 1)}
      />
      <motion.span
        className="glow-orb glow-orb--mint"
        animate={{ x: [0, 60, -70], y: [0, -50, 40], scale: [1, 1.15, 1] }}
        transition={drift(30, 2)}
      />
    </div>
  );
}

// The glow behind the hero. The original static glow (.page-glow background)
// stays underneath; the WebGL aurora fades in on top of it once its first
// frame is drawn.
export function AmbientGlow() {
  return (
    <div className="page-glow" aria-hidden="true">
      <Aurora fallback={<GlowOrbs />} />
    </div>
  );
}
