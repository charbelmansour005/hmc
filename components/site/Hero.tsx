import { CATEGORY_META } from "@/lib/categories";
import { telHref } from "@/lib/home-content";
import type { HomeSection, SettingsDTO } from "@/lib/types";
import { BookingCard } from "./BookingCard";
import { ClockIcon, PhoneIcon, PinIcon } from "./icons";
import { OpeningHours } from "./OpeningHours";

// The no-break space keeps the dash with "care" rather than opening a line.
const HEADLINE = "Comprehensive, human-centered care\u00a0– under one roof";

// The hero entrance is pure CSS (see site.css): it starts on first paint rather
// than after hydration, so the headline is never held back waiting for
// JavaScript. Each word gets its index (--i) to stagger the reveal.
const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** "Internal & General Medicine, Allergist and 10 more" from a section's services. */
function summary(section: HomeSection): string {
  const names = [...section.cards, ...section.features].map((item) => item.name);
  const shown = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${shown} and ${names.length - 2} more` : shown;
}

function count(section: HomeSection): string {
  const n = section.cards.length + section.features.length;
  return n === 1 ? "1 service" : `${n} services`;
}

export function Hero({ settings, sections }: { settings: SettingsDTO; sections: HomeSection[] }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 aria-label={HEADLINE}>
              {HEADLINE.split(" ").map((word, i) => (
                <span key={i}>
                  <span className="hero-word" style={at(i)} aria-hidden="true">
                    {word}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="hero-lede">
              Specialist medicine, dentistry, nutrition, esthetics and rehabilitation together in Naccache, so
              your whole family&apos;s care lives in one place.
            </p>
            <ul className="hero-facts">
              {settings.openingHours ? (
                <li>
                  <ClockIcon aria-hidden />
                  <OpeningHours value={settings.openingHours} />
                </li>
              ) : null}
              <li>
                <PinIcon aria-hidden />
                Naccache, Lebanon. Walk-ins welcome.
              </li>
              <li>
                <PhoneIcon aria-hidden />
                <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
            </ul>
          </div>

          <div className="hero-card">
            <BookingCard />
          </div>
        </div>

        {sections.length > 0 ? (
          // The lobby directory: every department at a glance, each one a jump to its section.
          <nav className="directory" id="services" aria-labelledby="directory-title">
            <h2 id="directory-title" className="visually-hidden">
              Departments
            </h2>
            <ul>
              {sections.map((section, i) => (
                <li key={section.anchor} style={at(i)}>
                  <a href={`#${section.anchor}`}>
                    <span className="directory-name">{CATEGORY_META[section.category].navLabel}</span>
                    <span className="directory-items">{summary(section)}</span>
                    <span className="directory-count">{count(section)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
