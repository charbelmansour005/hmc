"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { useI18n } from "./I18nProvider";

// The "Visit us" map: Mapbox Standard with its night light preset in dark mode
// (day preset in light mode, following the theme toggle). mapbox-gl is only
// downloaded when the section nears the viewport, then the camera glides in to
// a tilted view of the clinic. Cooperative gestures keep page scrolling free
// (zoom needs ⌘/Ctrl + scroll or two fingers). Without a token, or if Mapbox
// fails to start, the previous Google embed is shown instead.
//
// On the French and Arabic pages the map's own labels follow the page's
// language. The map itself always stays left-to-right (its controls and
// attribution are laid out that way); only our popup follows the page.

type LngLat = { lng: number; lat: number };

/** The clinic's pin on Google Maps, used when the location can't be resolved. */
const DEFAULT_CENTER: LngLat = { lat: 33.9285959, lng: 35.5966253 };

/** "33.9228, 35.5971" (latitude, longitude, as Google Maps shows them). */
const COORDINATES = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

function parseCoordinates(query: string): LngLat | null {
  const m = COORDINATES.exec(query);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}

/** Coordinates as-is; otherwise Mapbox geocoding (cached in the browser for a week). */
async function resolveLocation(query: string, token: string): Promise<LngLat> {
  const direct = parseCoordinates(query);
  if (direct) return direct;

  const key = `map-geocode:${query}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null") as { loc: LngLat; expires: number } | null;
    if (cached && cached.expires > Date.now()) return cached.loc;
  } catch {
    /* storage unavailable */
  }
  try {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&limit=1&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { features?: { geometry?: { coordinates?: number[] } }[] };
      const c = data.features?.[0]?.geometry?.coordinates;
      if (c && Number.isFinite(c[0]) && Number.isFinite(c[1])) {
        const loc = { lng: c[0], lat: c[1] };
        try {
          localStorage.setItem(key, JSON.stringify({ loc, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
        } catch {
          /* storage unavailable */
        }
        return loc;
      }
    }
  } catch {
    /* network error: fall through */
  }
  return DEFAULT_CENTER;
}

const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";

/** Mapbox's plugin that joins and orders Arabic map labels; without it they render letter by letter. */
const RTL_TEXT_PLUGIN = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.3.0/mapbox-gl-rtl-text.js";

/** The pin: brand-gradient teardrop with the "H" mark and a pulsing halo. */
function createPin(label: string): HTMLElement {
  const pin = document.createElement("div");
  pin.className = "map-pin";
  pin.setAttribute("aria-label", label);
  pin.innerHTML =
    '<span class="map-pin-pulse"></span>' +
    '<span class="map-pin-head"><svg viewBox="0 0 20 20" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 4.5v11M14 4.5v11M6 10h8"/></svg></span>';
  return pin;
}

/** Popup content built with DOM nodes (the address comes from the CMS: never innerHTML). */
function createPopup(
  text: { clinic: string; directions: string; lang: Locale; dir: "ltr" | "rtl" },
  place: string,
  center: LngLat,
): HTMLElement {
  const root = document.createElement("div");
  root.className = "map-popup";
  root.lang = text.lang;
  root.dir = text.dir;
  const title = document.createElement("strong");
  title.textContent = text.clinic;
  const where = document.createElement("span");
  where.textContent = place;
  const link = document.createElement("a");
  link.href = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = text.directions;
  root.append(title, where, link);
  return root;
}

function GoogleEmbed({ query, title, locale }: { query: string; title: string; locale: Locale }) {
  // English keeps Google's own choice of language, as before.
  const language = locale === DEFAULT_LOCALE ? "" : `&hl=${locale}`;
  return (
    <iframe
      title={title}
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed${language}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function LocationMap({
  token,
  query,
  address,
}: {
  /** Public Mapbox token (pk.*), or null to use the Google embed. */
  token: string | null;
  query: string;
  address: string | null;
}) {
  const { locale, dir, t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!token);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!token || !el) return;

    let map: MapboxMap | null = null;
    let cancelled = false;
    let themeObserver: MutationObserver | null = null;

    const fail = () => {
      cancelled = true;
      map?.remove();
      map = null;
      setFailed(true);
    };

    const start = async () => {
      try {
        const [{ default: mapboxgl }, center] = await Promise.all([import("mapbox-gl"), resolveLocation(query, token)]);
        if (cancelled) return;

        if (dir === "rtl" && mapboxgl.getRTLTextPluginStatus() === "unavailable") {
          // Lazy: fetched only once the map meets right-to-left text.
          mapboxgl.setRTLTextPlugin(
            RTL_TEXT_PLUGIN,
            (error) => {
              if (error) console.warn("[map] Arabic label support failed to load.", error);
            },
            true,
          );
        }

        const instance = new mapboxgl.Map({
          container: el,
          accessToken: token,
          style: "mapbox://styles/mapbox/standard",
          config: {
            basemap: {
              lightPreset: isDark() ? "night" : "day",
              showPointOfInterestLabels: true,
              showTransitLabels: false,
            },
          },
          center: [center.lng, center.lat],
          zoom: 12.6,
          cooperativeGestures: true,
          attributionControl: true,
          // English keeps the style's own label language, as before.
          ...(locale === DEFAULT_LOCALE ? {} : { language: locale }),
        });
        map = instance;
        instance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

        new mapboxgl.Marker({ element: createPin(fmt(t.map.pin, { clinic: t.clinic })), anchor: "bottom" })
          .setLngLat([center.lng, center.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 34, closeButton: false, maxWidth: "260px" }).setDOMContent(
              createPopup(
                { clinic: t.clinic, directions: t.map.directions, lang: locale, dir },
                address ?? query,
                center,
              ),
            ),
          )
          .addTo(instance);

        let styleLoaded = false;
        instance.on("load", () => {
          styleLoaded = true;
          setLoaded(true);
          // A cinematic glide in; Mapbox skips non-essential animations under reduced motion.
          instance.flyTo({ zoom: 15.4, pitch: 58, bearing: -20, duration: 3200, essential: false });
        });
        instance.on("error", (e: { error?: { status?: number; message?: string } }) => {
          // A bad or restricted token fails before the style loads: fall back to Google.
          const status = e.error?.status;
          if (!styleLoaded && (status === 401 || status === 403 || /style/i.test(e.error?.message ?? ""))) fail();
        });

        themeObserver = new MutationObserver(() => {
          instance.setConfigProperty("basemap", "lightPreset", isDark() ? "night" : "day");
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      } catch (err) {
        console.warn("[map] Mapbox failed to start; showing the fallback map.", err);
        if (!cancelled) fail();
      }
    };

    // Only download mapbox-gl when the map is about to scroll into view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void start();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      themeObserver?.disconnect();
      map?.remove();
    };
  }, [token, query, address, locale, dir, t]);

  const title = fmt(t.map.region, { place: address ?? query });
  if (failed) return <GoogleEmbed query={query} title={fmt(t.map.region, { place: query })} locale={locale} />;
  return (
    <div
      ref={containerRef}
      className={loaded ? "map-canvas is-loaded" : "map-canvas"}
      dir="ltr"
      role="region"
      aria-label={title}
    />
  );
}
