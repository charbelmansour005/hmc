"use client";

import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { NavLink } from "@/lib/types";
import { HmcLogoCompact } from "./HmcLogo";

const PILL_SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

/** The nav section currently under the reading line (40–45% down the viewport), if any. */
function useActiveSection(nav: NavLink[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const ids = nav.map((link) => link.href.replace(/^#/, ""));
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [nav]);

  return active;
}

const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function SiteHeader({ nav }: { nav: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const active = useActiveSection(nav);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <nav ref={navRef} className={open ? "nav nav-open" : "nav"} aria-label="Main">
          <a className="brand" href="#top" aria-label="Hajj Medical Center home">
            <HmcLogoCompact id="header-logo" />
          </a>

          <ul className="nav-links" id="nav-links">
            {nav.map((link, i) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href} style={at(i)}>
                  <a
                    href={link.href}
                    onClick={close}
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {/* One shared pill that glides to whichever section you're reading. */}
                    {isActive ? <m.span layoutId="nav-pill" className="nav-pill" transition={PILL_SPRING} /> : null}
                    {link.label}
                  </a>
                </li>
              );
            })}
            <li className="nav-links-cta" style={at(nav.length)}>
              <a className="btn btn-primary btn-block" href="#book" onClick={close}>
                Book an appointment
              </a>
            </li>
          </ul>

          <a className="btn btn-primary btn-sm nav-cta" href="#book">
            Book an appointment
          </a>

          <ThemeToggle className="theme-toggle" />

          <button
            className="nav-toggle"
            type="button"
            aria-controls="nav-links"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
          </button>
        </nav>
      </div>
    </header>
  );
}
