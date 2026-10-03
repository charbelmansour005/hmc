"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  dirOf,
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  LOCALE_NAMES,
  LOCALES,
  switchHref,
  type Locale,
} from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";
import { GlobeIcon } from "./icons";

// The three languages are separate pages (/, /fr, /ar), so these are ordinary
// links: they work without JavaScript and reload the page in the new language
// and direction. Each language is written in its own script.

/**
 * Remembers the pick, so that "/" opens in this language next time
 * (middleware.ts), and keeps the #section of the address, if there is one.
 */
function onPick(locale: Locale) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LANG_COOKIE}=${locale}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax${secure}`;
    e.currentTarget.hash = window.location.hash;
  };
}

function linkProps(target: Locale, current: Locale) {
  return {
    href: switchHref(target),
    hrefLang: target,
    lang: target,
    dir: dirOf(target),
    "aria-current": target === current ? ("true" as const) : undefined,
    onClick: onPick(target),
  };
}

/** The header's language menu (wider screens). */
export function LanguageMenu() {
  const { locale, t } = useI18n();
  return (
    <Menu>
      <MenuButton className="lang-toggle" aria-label={`${t.nav.language}: ${LOCALE_NAMES[locale]}`}>
        <GlobeIcon aria-hidden />
        <span aria-hidden="true">{locale.toUpperCase()}</span>
      </MenuButton>
      <MenuItems anchor="bottom end" transition className="combo-options lang-menu">
        {LOCALES.map((target) => (
          <MenuItem key={target}>
            <a className="combo-option lang-option" {...linkProps(target, locale)}>
              {LOCALE_NAMES[target]}
            </a>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

/** The same choice as a plain row of links (phone menu, footer). */
export function LanguageLinks({ className }: { className: string }) {
  const { locale, t } = useI18n();
  return (
    <nav className={className} aria-label={t.nav.language}>
      <ul>
        {LOCALES.map((target) => (
          <li key={target}>
            <a {...linkProps(target, locale)}>{LOCALE_NAMES[target]}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
