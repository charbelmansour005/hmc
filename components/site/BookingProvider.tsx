"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { upcomingBookingDates } from "@/lib/booking-dates";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/en";
import type { BookingGroup } from "@/lib/types";
import { useI18n } from "./I18nProvider";

export type DayOption = { value: string; label: string; short: string };
export type BookingField = "service" | "date";

type BookingState = {
  groups: BookingGroup[];
  phone: string;
  serviceId: string;
  setServiceId: (id: string) => void;
  date: string;
  setDate: (value: string) => void;
  days: DayOption[];
  serviceLabel: (id: string) => string | null;
  /** The service's English name: the WhatsApp request repeats it for staff. */
  serviceLabelEn: (id: string) => string | null;
  dayLabel: (value: string) => string | null;
  errors: Set<BookingField>;
  setErrors: (fields: BookingField[]) => void;
  clearError: (field: BookingField) => void;
  bookingRef: React.RefObject<HTMLFormElement | null>;
  contactRef: React.RefObject<HTMLFormElement | null>;
  nameRef: React.RefObject<HTMLInputElement | null>;
  reset: () => void;
};

const BookingContext = createContext<BookingState | null>(null);

export function useBooking(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

/** Restart the teal ring animation on an element. */
export function flash(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("is-flash");
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add("is-flash");
}

/** The next two weeks without the days the clinic is closed (weekends). */
function nextDays(locale: Locale, t: Messages): DayOption[] {
  const day = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short" });
  return upcomingBookingDates().map(({ value, date, offset }) => {
    const short = day.format(date);
    const label =
      offset === 0
        ? fmt(t.booking.today, { date: short })
        : offset === 1
          ? fmt(t.booking.tomorrow, { date: short })
          : short;
    return { value, label, short };
  });
}

export function BookingProvider({
  groups,
  phone,
  children,
}: {
  groups: BookingGroup[];
  phone: string;
  children: React.ReactNode;
}) {
  const { locale, t } = useI18n();
  const [serviceId, setServiceIdState] = useState("");
  const [date, setDateState] = useState("");
  // Dates are computed on the client to avoid a server/client timezone mismatch.
  const [days, setDays] = useState<DayOption[]>([]);
  const [errors, setErrorSet] = useState<Set<BookingField>>(new Set());
  const bookingRef = useRef<HTMLFormElement>(null);
  const contactRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDays(nextDays(locale, t)), [locale, t]);

  const labels = useMemo(() => {
    const map = new Map<string, { label: string; labelEn: string }>();
    for (const g of groups) for (const o of g.options) map.set(o.id, o);
    return map;
  }, [groups]);

  const clearError = useCallback((field: BookingField) => {
    setErrorSet((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const setServiceId = useCallback(
    (id: string) => {
      setServiceIdState(id);
      if (id) clearError("service");
    },
    [clearError],
  );

  const setDate = useCallback(
    (value: string) => {
      setDateState(value);
      if (value) clearError("date");
    },
    [clearError],
  );

  // Clicking any card or "Learn more" preselects the service it books.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-service]");
      const id = el?.dataset.service;
      if (!id || !labels.has(id)) return;
      setServiceId(id);
      flash(bookingRef.current);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [labels, setServiceId]);

  const value = useMemo<BookingState>(
    () => ({
      groups,
      phone,
      serviceId,
      setServiceId,
      date,
      setDate,
      days,
      serviceLabel: (id) => labels.get(id)?.label ?? null,
      serviceLabelEn: (id) => labels.get(id)?.labelEn ?? null,
      dayLabel: (v) => days.find((d) => d.value === v)?.short ?? null,
      errors,
      setErrors: (fields) => setErrorSet(new Set(fields)),
      clearError,
      bookingRef,
      contactRef,
      nameRef,
      reset: () => {
        setServiceIdState("");
        setDateState("");
        setErrorSet(new Set());
      },
    }),
    [groups, phone, serviceId, setServiceId, date, setDate, days, labels, errors, clearError],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
