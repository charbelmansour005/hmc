import { telHref } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n/config";
import { plural } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/en";
import type { HomeSection, PublicSettings } from "@/lib/types";
import { BookingCard } from "./BookingCard";
import { ClockIcon, PhoneIcon, PinIcon } from "./icons";
import { OpeningHours } from "./OpeningHours";

// The hero entrance is pure CSS (see site.css): it starts on first paint rather
// than after hydration, so the headline is never held back waiting for
// JavaScript. Each word gets its index (--i) to stagger the reveal.
const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** "Internal & General Medicine, Allergist and 10 more" from a section's services. */
function summary(section: HomeSection, locale: Locale, t: Messages): string {
  const names = [...section.cards, ...section.features].map((item) => item.name);
  const shown = names.slice(0, 2).join(t.hero.listSeparator);
  return names.length > 2 ? plural(locale, names.length - 2, t.hero.andMore, { items: shown }) : shown;
}

function count(section: HomeSection, locale: Locale, t: Messages): string {
  return plural(locale, section.cards.length + section.features.length, t.hero.serviceCount);
}

export function Hero({
  settings,
  sections,
  locale,
  t,
}: {
  settings: PublicSettings;
  sections: HomeSection[];
  locale: Locale;
  t: Messages;
}) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 aria-label={t.hero.headline}>
              {t.hero.headline.split(" ").map((word, i) => (
                <span key={i}>
                  <span className="hero-word" style={at(i)} aria-hidden="true">
                    {word}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="hero-lede">{t.hero.lede}</p>
            <ul className="hero-facts">
              {settings.openingHours ? (
                <li>
                  <ClockIcon aria-hidden />
                  <OpeningHours value={settings.openingHours} />
                </li>
              ) : null}
              <li>
                <PinIcon aria-hidden />
                {t.hero.location}
              </li>
              <li>
                <PhoneIcon aria-hidden />
                <a href={telHref(settings.phone)} dir="ltr">
                  {settings.phone}
                </a>
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
              {t.hero.departments}
            </h2>
            <ul>
              {sections.map((section, i) => (
                <li key={section.anchor} style={at(i)}>
                  <a href={`#${section.anchor}`}>
                    <span className="directory-name">{section.navLabel}</span>
                    <span className="directory-items">{summary(section, locale, t)}</span>
                    <span className="directory-count">{count(section, locale, t)}</span>
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
