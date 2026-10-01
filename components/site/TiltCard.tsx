"use client";

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCardReveal } from "./motion/useCardReveal";
import { cardIn } from "./motion/variants";

// Each card fades up on its own as it scrolls into view ("hidden" -> "show",
// staggered by its column; see useCardReveal). On hover it lifts, zooms its
// image (the inner .media-zoom inherits "hover"), tilts towards the cursor and
// catches a soft glare on the photo. Tilt and glare are mouse-only and are
// skipped entirely when the visitor prefers reduced motion.
const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

type Props = {
  as?: "a" | "article";
  className: string;
  href?: string;
  /** Service id the card preselects in the booking card (read by BookingProvider). */
  service?: string;
  /** Maximum tilt in degrees. */
  tilt?: number;
  children: React.ReactNode;
};

export function TiltCard({ as = "a", className, href, service, tilt = 5, children }: Props) {
  const reduce = useReducedMotion();
  const { ref, ...reveal } = useCardReveal<HTMLElement>();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), TILT_SPRING);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    // The glare is drawn on the photo only (site.css), in the photo's own coordinates,
    // so the card's text is never washed out.
    const media = card.querySelector<HTMLElement>(".card-media, .feature-media");
    if (media) {
      const m = media.getBoundingClientRect();
      card.style.setProperty("--gx", `${Math.round(e.clientX - m.left)}px`);
      card.style.setProperty("--gy", `${Math.round(e.clientY - m.top)}px`);
    }
  };
  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const shared = {
    ...reveal,
    className,
    variants: cardIn,
    whileHover: "hover",
    onPointerMove,
    onPointerLeave,
    style: { rotateX, rotateY, transformPerspective: 1000 },
  };

  if (as === "article") {
    return (
      <m.article ref={ref as React.Ref<HTMLElement>} {...shared}>
        {children}
      </m.article>
    );
  }
  return (
    <m.a ref={ref as React.Ref<HTMLAnchorElement>} {...shared} href={href} data-service={service}>
      {children}
    </m.a>
  );
}
