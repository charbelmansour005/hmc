"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { telHref } from "@/lib/home-content";
import type { NavLink } from "@/lib/types";
import { HmcLogoCompact } from "./HmcLogo";
import { PhoneIcon } from "./icons";

const PILL_SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
const SHEET_EASE = [0.22, 1, 0.36, 1] as const;

const idsOf = (link: NavLink) => [link.href.replace(/^#/, ""), ...(link.match ?? [])];

/** The href of the nav link whose section is under the reading line (40–45% down the viewport), if any. */
function useActiveLink(nav: NavLink[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(nav.find((link) => idsOf(link).some((id) => visible.has(id)))?.href ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of nav.flatMap(idsOf)) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [nav]);

  return active;
}

/** True once the page has scrolled past the very top (the bar then gets its background). */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteHeader({ nav, phone }: { nav: NavLink[]; phone: string }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = useActiveLink(nav);
  const scrolled = useScrolled();

  // While the menu is open: the page behind it doesn't scroll, Escape closes it,
  // and Tab cycles through the bar and the menu only.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = [...headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    // The menu closes itself once the layout widens past the breakpoint.
    const wide = window.matchMedia("(min-width: 901px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header ref={headerRef} className="site-header" data-scrolled={scrolled || open ? "" : undefined}>
      <div className="container">
        <nav className="nav" aria-label="Main">
          <a className="brand" href="#top" aria-label="Hajj Medical Center home" onClick={close}>
            <HmcLogoCompact id="header-logo" />
          </a>

          <ul className="nav-links">
            {nav.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {/* One shared pill that glides to whichever section you're reading. */}
                    {isActive ? <motion.span layoutId="nav-pill" className="nav-pill" transition={PILL_SPRING} /> : null}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="nav-actions">
            <a className="nav-phone" href={telHref(phone)}>
              <PhoneIcon aria-hidden />
              {phone}
            </a>
            <a className="btn btn-primary btn-sm nav-cta" href="#book" onClick={close}>
              Book a visit
            </a>
            <ThemeToggle className="theme-toggle" />
            <button
              ref={toggleRef}
              className="nav-toggle"
              type="button"
              aria-controls="nav-menu"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span></span>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="nav-menu"
            className="nav-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: SHEET_EASE }}
          >
            <ul className="container">
              {nav.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, ease: SHEET_EASE, delay: 0.05 + i * 0.04 }}
                >
                  <a href={link.href} onClick={close} aria-current={active === link.href ? "true" : undefined}>
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <li className="nav-menu-phone">
                <a href={telHref(phone)}>
                  <PhoneIcon aria-hidden />
                  Call {phone}
                </a>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
