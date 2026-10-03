"use client";

import { rich } from "@/lib/i18n/rich";
import type { Messages } from "@/lib/i18n/messages/en";

// The page is unavailable, so Settings are too: this number is the fallback.
const PHONE = "+961 4 520 065";
const TEL = "tel:+9614520065";

/** Shown if a page cannot load its content (e.g. the database is unreachable). */
export function SiteErrorView({ t, reset }: { t: Messages["error"]; reset: () => void }) {
  return (
    <main id="top">
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>{t.title}</h1>
            <p className="hero-lede">
              {rich(t.body, {
                phone: (
                  <a href={TEL} dir="ltr">
                    {PHONE}
                  </a>
                ),
              })}
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={reset}>
                {t.retry}
              </button>
              <a className="btn btn-light" href={TEL}>
                {rich(t.call, { phone: <bdi dir="ltr">{PHONE}</bdi> })}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
