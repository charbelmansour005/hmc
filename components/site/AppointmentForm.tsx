"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { isValidPhone, whatsappUrl } from "@/lib/phone";
import { flash, useBooking, type BookingField } from "./BookingProvider";
import { fadeUp } from "./motion/variants";
import { smoothScrollTo } from "./scroll";

type ApiError = { error?: { code?: string; message?: string; fields?: Record<string, string> } };
type ContactField = "name" | "phone";

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "2026-09-29" -> "Tuesday 29 September 2026" (a calendar date, so no time zone shift). */
function formatDay(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return longDate.format(new Date(y, m - 1, d));
}

/** The WhatsApp message the visitor sends; *…* is bold in WhatsApp. */
function requestMessage(r: { name: string; phone: string; service: string; date: string }): string {
  return [
    "Hello Hajj Medical Center, I'd like to request an appointment.",
    "",
    `*Name:* ${r.name}`,
    `*Phone:* ${r.phone}`,
    `*Service:* ${r.service}`,
    `*Preferred date:* ${formatDay(r.date)}`,
  ].join("\n");
}

/** Opens WhatsApp in a new tab, or in this one if the browser blocks pop-ups. */
function openWhatsApp(url: string) {
  const win = window.open(url, "_blank");
  if (!win) {
    window.location.href = url;
    return;
  }
  try {
    win.opener = null;
  } catch {
    // Already navigated cross-origin; nothing to detach.
  }
}

// Step 2 of the booking flow. Collects only name and phone; the service and
// preferred date come from the hero booking card. No free-text field on
// purpose: requests must not carry clinical details.
//
// `whatsapp` (digits, from Settings) switches the destination: the form opens
// a WhatsApp chat with the request filled in, and nothing reaches our server.
// Without it, the request is saved to the CMS inbox via /api/appointments.
export function AppointmentForm({ whatsapp }: { whatsapp: string | null }) {
  const booking = useBooking();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Set<ContactField>>(new Set());
  const [success, setSuccess] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // A WhatsApp hand-off note describes one exact request; drop it once the
  // service or date changes so its "open again" link is never stale.
  const { serviceId, date } = booking;
  useEffect(() => {
    setChatUrl("");
    if (whatsapp) setSuccess("");
  }, [serviceId, date, whatsapp]);

  const clearFieldError = (field: ContactField) =>
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });

  const onContactChange = (field: ContactField) => {
    clearFieldError(field);
    if (chatUrl) {
      setChatUrl("");
      setSuccess("");
    }
  };

  const sendToWhatsApp = (digits: string) => {
    // Nothing goes through our server, so check what the API would have.
    const invalid: ContactField[] = [
      ...(name.trim().length >= 2 ? [] : (["name"] as const)),
      ...(isValidPhone(phone) ? [] : (["phone"] as const)),
    ];
    if (invalid.length > 0) {
      setFieldErrors(new Set(invalid));
      setError(
        invalid.includes("phone") && phone.trim()
          ? "Please enter a valid phone number."
          : "Please enter your full name.",
      );
      document.getElementById(invalid[0])?.focus();
      return;
    }

    const url = whatsappUrl(
      digits,
      requestMessage({
        name: name.trim().replace(/\s+/g, " "),
        phone: phone.trim(),
        service: booking.serviceLabel(booking.serviceId) ?? "",
        date: booking.date,
      }),
    );
    openWhatsApp(url);
    setChatUrl(url);
    const first = name.trim().split(/\s+/)[0];
    setSuccess(`Almost done, ${first}! Tap Send in WhatsApp to deliver your request, and we'll reply to confirm.`);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setChatUrl("");
    setError("");

    const missingBooking: BookingField[] = [
      ...(booking.serviceId ? [] : (["service"] as const)),
      ...(booking.date ? [] : (["date"] as const)),
    ];
    const missingFields = [
      ...(name.trim() ? [] : (["name"] as const)),
      ...(phone.trim() ? [] : (["phone"] as const)),
    ];
    setFieldErrors(new Set(missingFields));

    if (missingBooking.length > 0) {
      booking.setErrors(missingBooking);
      setError("Please choose a service and a preferred date in the booking card first.");
      const card = booking.bookingRef.current;
      if (card) smoothScrollTo(card, "center");
      flash(card);
      return;
    }
    if (missingFields.length > 0) {
      document.getElementById(missingFields[0])?.focus();
      return;
    }

    if (whatsapp) {
      sendToWhatsApp(whatsapp);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferredDate: booking.date,
          serviceId: booking.serviceId,
          website,
        }),
      });

      if (res.status === 201) {
        const first = name.trim().split(/\s+/)[0];
        setSuccess(`Thanks, ${first}! We've received your request and will call you to confirm.`);
        setName("");
        setPhone("");
        setWebsite("");
        booking.reset();
        return;
      }

      const body = (await res.json().catch(() => ({}))) as ApiError;
      const fields = body.error?.fields ?? {};
      setFieldErrors(new Set((["name", "phone"] as const).filter((f) => f in fields)));
      const bookingFields: BookingField[] = [
        ...("serviceId" in fields ? (["service"] as const) : []),
        ...("preferredDate" in fields ? (["date"] as const) : []),
      ];
      if (bookingFields.length > 0) booking.setErrors(bookingFields);
      setError(body.error?.message ?? `Something went wrong. Please call us on ${booking.phone}.`);
    } catch {
      setError(`We couldn't send your request. Please check your connection or call us on ${booking.phone}.`);
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: ContactField) => "input" + (fieldErrors.has(field) ? " is-error" : "");

  return (
    // Reveals with the "Visit us" block (it inherits hidden/show from the parent).
    <m.form
      className="panel"
      id="contact-form"
      noValidate
      ref={booking.contactRef}
      onSubmit={onSubmit}
      variants={fadeUp}
    >
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          ref={booking.nameRef}
          className={inputClass("name")}
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onContactChange("name");
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          className={inputClass("phone")}
          id="phone"
          name="phone"
          type="tel"
          placeholder="Your phone number"
          autoComplete="tel"
          required
          maxLength={24}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            onContactChange("phone");
          }}
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
        {whatsapp ? "Send on WhatsApp" : sending ? "Sending…" : "Send request"}
      </button>
      <p className={success ? "form-success is-visible" : "form-success"} role="status" aria-live="polite">
        {success}
        {success && chatUrl ? (
          <>
            {" "}
            <a className="form-success-link" href={chatUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp didn&apos;t open? Open it here
            </a>
          </>
        ) : null}
      </p>
      <p className={error ? "form-error is-visible" : "form-error"} role="alert">
        {error}
      </p>
    </m.form>
  );
}
