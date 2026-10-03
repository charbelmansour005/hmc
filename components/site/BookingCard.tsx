"use client";

import { useEffect, useState } from "react";
import { fmt } from "@/lib/i18n/format";
import { flash, useBooking } from "./BookingProvider";
import { DateListbox } from "./DateListbox";
import { useI18n } from "./I18nProvider";
import { smoothScrollTo } from "./scroll";
import { ServiceCombobox } from "./ServiceCombobox";

// Step 1 of the booking flow: pick a service and a preferred date, then hand
// off to the "Visit us" form, which collects name and phone and submits.
export function BookingCard() {
  const booking = useBooking();
  const { t } = useI18n();
  const [note, setNote] = useState("");

  // Clear the hand-off note once a request has been sent (selection reset).
  const cleared = !booking.serviceId && !booking.date;
  useEffect(() => {
    if (cleared) setNote("");
  }, [cleared]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const missing = [
      ...(booking.serviceId ? [] : (["service"] as const)),
      ...(booking.date ? [] : (["date"] as const)),
    ];
    if (missing.length > 0) {
      booking.setErrors([...missing]);
      document.getElementById(missing[0])?.focus();
      return;
    }

    const service = booking.serviceLabel(booking.serviceId);
    const day = booking.dayLabel(booking.date);
    setNote(fmt(t.booking.note, { service: service ?? "", date: day ?? "" }));

    setTimeout(() => {
      const contact = booking.contactRef.current;
      if (contact) smoothScrollTo(contact, "center");
      booking.nameRef.current?.focus({ preventScroll: true });
      flash(contact);
    }, 900);
  };

  return (
    <form className="booking" id="book" noValidate ref={booking.bookingRef} onSubmit={onSubmit}>
      <h2>{t.booking.title}</h2>
      <div className="field">
        <label htmlFor="service">{t.booking.service}</label>
        <ServiceCombobox />
      </div>
      <div className="field">
        <label htmlFor="date">{t.booking.date}</label>
        <DateListbox />
      </div>
      <button className="btn btn-primary btn-block" type="submit">
        {t.booking.continue}
      </button>
      <p className={note ? "form-success is-visible" : "form-success"} role="status" aria-live="polite">
        {note}
      </p>
    </form>
  );
}
