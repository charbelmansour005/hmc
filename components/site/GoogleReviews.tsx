"use client";

import { motion } from "motion/react";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { fmt, formatNumber, pluralForm } from "@/lib/i18n/format";
import { rich } from "@/lib/i18n/rich";
import type { GoogleReviewDTO, GoogleReviewsDTO } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import { ChevronIcon, StarRating } from "./icons";
import { cascade, fadeUp, VIEWPORT } from "./motion/variants";
import { RevealCard } from "./RevealCard";

type State = { status: "loading" } | { status: "ready"; data: GoogleReviewsDTO } | { status: "hidden" };

const SKELETONS = [0, 1, 2];
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Loads the reviews once the section is within `margin` of the viewport.
 * Google answers in the page's language: it translates the reviews written in
 * another one, and words the "2 weeks ago" times.
 */
function useReviews(sectionRef: React.RefObject<HTMLElement | null>, locale: Locale): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/reviews?lang=${locale}`, { cache: "no-store" });
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as GoogleReviewsDTO;
        if (!cancelled) setState(data.total > 0 ? { status: "ready", data } : { status: "hidden" });
      } catch {
        if (!cancelled) setState({ status: "hidden" });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void load();
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(section);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [sectionRef, locale]);

  return state;
}

/**
 * Prev/next paging for a native horizontal scroller. In a right-to-left page
 * the track starts at its right edge and scrollLeft runs from 0 down to
 * negative values, hence the absolute value and the sign.
 */
function useCarousel(count: number, dir: "ltr" | "rtl") {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setEdges({
        start: Math.abs(el.scrollLeft) <= 2,
        end: Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 2,
      });
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [count]);

  const page = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forward = dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: direction * forward * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return { ref, edges, page, scrollable: !(edges.start && edges.end) };
}

// "What patients say": live Google reviews. Google bills every load and its
// terms forbid caching them, so they are requested only once the visitor
// scrolls near the section. Until then a skeleton with the same dimensions
// holds the space, so nothing below moves when they arrive; on any failure the
// whole section is removed instead.
export function GoogleReviewsSection() {
  const { locale, dir, t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const state = useReviews(sectionRef, locale);
  const data = state.status === "ready" ? state.data : null;
  const reviews = data?.reviews ?? [];
  const carousel = useCarousel(reviews.length, dir);
  const rating = data?.rating
    ? formatNumber(locale, data.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : null;
  // "Previous" points back the way the text came from: left, or right in Arabic.
  const [back, onward] = dir === "rtl" ? (["right", "left"] as const) : (["left", "right"] as const);

  if (state.status === "hidden") return null;

  return (
    <section className="section" id="reviews" ref={sectionRef} aria-busy={!data}>
      <div className="container">
        <div className="reviews-head">
          <motion.div className="section-head" initial="hidden" whileInView="show" viewport={VIEWPORT} variants={cascade(0.1)}>
            <motion.h2 variants={fadeUp}>{t.reviews.title}</motion.h2>
            <motion.p className="reviews-summary" variants={fadeUp}>
              {data?.rating && rating ? (
                <>
                  <strong>{rating}</strong>
                  <StarRating value={data.rating} label={fmt(t.reviews.rated, { rating })} />
                  <span>
                    {rich(pluralForm(locale, data.total, t.reviews.count), {
                      n: formatNumber(locale, data.total),
                      maps: (
                        <span className="gmaps-attribution" translate="no">
                          Google Maps
                        </span>
                      ),
                    })}
                  </span>
                </>
              ) : (
                <span className="skeleton-line" aria-hidden="true" />
              )}
            </motion.p>
          </motion.div>
          {carousel.scrollable ? (
            <div className="reviews-nav">
              <button
                type="button"
                aria-label={t.reviews.previous}
                aria-controls="reviews-track"
                disabled={carousel.edges.start}
                onClick={() => carousel.page(-1)}
              >
                <ChevronIcon direction={back} />
              </button>
              <button
                type="button"
                aria-label={t.reviews.next}
                aria-controls="reviews-track"
                disabled={carousel.edges.end}
                onClick={() => carousel.page(1)}
              >
                <ChevronIcon direction={onward} />
              </button>
            </div>
          ) : null}
        </div>

        {data ? (
          reviews.length > 0 ? (
            <div
              className="reviews-track"
              id="reviews-track"
              ref={carousel.ref}
              role="region"
              aria-label={t.reviews.region}
              tabIndex={0}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : null
        ) : (
          <div className="reviews-track" aria-hidden="true">
            {SKELETONS.map((i) => (
              <div className="review review--skeleton" key={i}>
                <span className="skeleton-avatar" />
                <span className="skeleton-line" />
                <span className="skeleton-line skeleton-line--short" />
              </div>
            ))}
          </div>
        )}

        <div className="reviews-foot">
          {/* Same buttons while loading (invisible), so the row keeps its height. */}
          <div className={data ? "reviews-actions" : "reviews-actions is-pending"} aria-hidden={!data}>
            {data?.reviewsUrl || !data ? (
              <a className="btn btn-light btn-sm" href={data?.reviewsUrl ?? undefined} {...external} tabIndex={data ? undefined : -1}>
                {t.reviews.readAll}
              </a>
            ) : null}
            {data?.writeReviewUrl || !data ? (
              <a className="btn btn-primary btn-sm" href={data?.writeReviewUrl ?? undefined} {...external} tabIndex={data ? undefined : -1}>
                {t.reviews.write}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: GoogleReviewDTO }) {
  const { t } = useI18n();
  const [showOriginal, setShowOriginal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const shown = showOriginal && review.original ? review.original : { text: review.text, lang: review.lang };

  // "Read more" only when the line clamp actually hides something.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown.text]);

  return (
    <RevealCard as="article" className="review">
      <header className="review-head">
        <Avatar review={review} />
        <div className="review-meta">
          {review.authorUrl ? (
            <a className="review-author" href={review.authorUrl} {...external}>
              {review.author}
            </a>
          ) : (
            <span className="review-author">{review.author}</span>
          )}
          <span className="review-time">{review.relativeTime}</span>
        </div>
      </header>
      <StarRating value={review.rating} label={fmt(t.reviews.rated, { rating: review.rating })} />
      <p ref={textRef} className={expanded ? "review-text is-open" : "review-text"} lang={shown.lang ?? undefined} dir="auto">
        {shown.text}
      </p>
      {overflowing || expanded ? (
        <button type="button" className="review-toggle" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? t.reviews.showLess : t.reviews.readMore}
        </button>
      ) : null}
      {review.original ? (
        <p className="review-translated">
          {t.reviews.translated} ·{" "}
          <button type="button" className="review-toggle" onClick={() => setShowOriginal((v) => !v)}>
            {showOriginal ? t.reviews.showTranslation : t.reviews.showOriginal}
          </button>
        </p>
      ) : null}
      {review.url ? (
        <a className="review-link" href={review.url} {...external}>
          {t.reviews.viewOnMaps}
        </a>
      ) : null}
    </RevealCard>
  );
}

function Avatar({ review }: { review: GoogleReviewDTO }) {
  const [failed, setFailed] = useState(false);
  const initial = review.author.trim().charAt(0).toUpperCase() || "G";
  const face =
    review.authorPhoto && !failed ? (
      // Google's avatar URL as served: Places content may not be proxied or cached.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={review.authorPhoto}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    ) : (
      initial
    );

  return review.authorUrl ? (
    <a className="review-avatar" href={review.authorUrl} {...external} tabIndex={-1} aria-hidden="true">
      {face}
    </a>
  ) : (
    <span className="review-avatar" aria-hidden="true">
      {face}
    </span>
  );
}
