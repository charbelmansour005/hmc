import { animateValue, type AnimationPlaybackControls } from "framer-motion";

// One Motion-driven page scroll at a time. Driving the scroll ourselves, rather
// than relying on the browser's native smoothing, gives the same easing in every
// browser. Any manual input (wheel, touch, keys) hands control straight back.
// When the visitor prefers reduced motion, the jump is instant instead.

let active: AnimationPlaybackControls | null = null;
let startedAt = 0;
let savedBehavior: string | null = null;
let listening = false;

function release() {
  active = null;
  if (savedBehavior !== null) {
    document.documentElement.style.scrollBehavior = savedBehavior;
    savedBehavior = null;
  }
}

export function stopSmoothScroll() {
  if (!active) return;
  active.stop();
  release();
}

function listenForTakeover() {
  if (listening) return;
  listening = true;
  // Ignore the first moments so the input that started the scroll can't cancel it.
  const takeover = () => {
    if (active && performance.now() - startedAt > 150) stopSmoothScroll();
  };
  window.addEventListener("wheel", takeover, { passive: true });
  window.addEventListener("touchstart", takeover, { passive: true });
  window.addEventListener("keydown", takeover);
}

function targetY(el: Element, block: "start" | "center"): number {
  const rect = el.getBoundingClientRect();
  if (block === "center" && rect.height < window.innerHeight * 0.9) {
    return window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
  }
  // Respect scroll-margin-top, which keeps targets clear of the sticky header.
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return window.scrollY + rect.top - margin;
}

/** Smoothly scroll the page to an element (or the very top). */
export function smoothScrollTo(target: Element | "top", block: "start" | "center" = "start"): void {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const to = Math.min(max, Math.max(0, target === "top" ? 0 : targetY(target, block)));
  const from = window.scrollY;
  stopSmoothScroll();
  if (Math.abs(to - from) < 2) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, to);
    return;
  }

  listenForTakeover();
  // Our per-frame scrollTo calls must not be smoothed a second time by CSS.
  savedBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  startedAt = performance.now();
  // animateValue is Motion's bare value tween (the engine animate() uses for a
  // single number) without animate()'s element machinery. It takes milliseconds.
  active = animateValue({
    keyframes: [from, to],
    duration: Math.min(1150, 450 + Math.abs(to - from) / 3.2),
    ease: [0.65, 0, 0.35, 1],
    onUpdate: (y) => window.scrollTo(0, y),
    onComplete: release,
  });
}
