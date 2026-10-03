"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const META_COLOR: Record<Theme, string> = { light: "#eaf1f8", dark: "#0d151d" };

/** What the button does, said in words (the CMS uses these; the public site passes its own language). */
const LABELS = { toLight: "Switch to light mode", toDark: "Switch to dark mode" };

/** Light/dark toggle. Dark is the default (rendered on the server); the head
 *  script switches to light for visitors who chose it. This flips and
 *  remembers the choice. Both icons are always rendered: CSS (theme.css)
 *  morphs between them off data-theme, so the right one shows from the first
 *  paint with no flicker. */
export function ThemeToggle({ className, labels = LABELS }: { className?: string; labels?: typeof LABELS }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current: Theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    setTheme(current);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[current]);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode / storage disabled — the choice just won't persist */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[next]);
  };

  const label = theme === "dark" ? labels.toLight : labels.toDark;

  return (
    <button type="button" className={className} onClick={toggle} aria-label={label} title={label}>
      <svg className="theme-icon theme-icon--moon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg
        className="theme-icon theme-icon--sun"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
