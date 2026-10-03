"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, INTL_LOCALE } from "@/lib/i18n/config";
import { fmt, ltr } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/en";
import { isValidPhone, whatsappUrl } from "@/lib/phone";
import { flash, useBooking, type BookingField } from "./BookingProvider";
import { useI18n } from "./I18nProvider";
import { fadeUp } from "./motion/variants";
import { smoothScrollTo } from "./scroll";

type ApiError = { error?: { code?: string; message?: string; fields?: Record<string, string> } };
type ContactField = "name" | "phone";

/** The WhatsApp message the visitor sends, in the page's language; *…* is bold in WhatsApp. */
function requestMessage(
  m: Messages["form"]["whatsappMessage"],
  r: { name: string; phone: string; service: string; date: string },
): string {
  return [
    m.greeting,
    "",
    fmt(m.name, { value: r.name }),
    fmt(m.phone, { value: r.phone }),
    fmt(m.service, { value: r.service }),
    fmt(m.date, { value: r.date }),
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
  const { locale, dir, t } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Set<ContactField>>(new Set());
  const [success, setSuccess] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  /** "2026-09-29" -> "Tuesday 29 September 2026" (a calendar date, so no time zone shift). */
  const formatDay = useMemo(() => {
    const longDate = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return (value: string) => {
      const [y, m, d] = value.split("-").map(Number);
      return longDate.format(new Date(y, m - 1, d));
    };
  }, [locale]);

  // A phone number inside an Arabic sentence must keep its left-to-right order.
  const inText = (number: string) => (dir === "rtl" ? ltr(number) : number);

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
      setError(invalid.includes("phone") && phone.trim() ? t.form.errors.phoneInvalid : t.form.errors.nameMissing);
      document.getElementById(invalid[0])?.focus();
      return;
    }

    // The clinic's staff work in English: on a translated page the service is
    // followed by its English name, e.g. "أمراض القلب (Cardiology)".
    const service = booking.serviceLabel(booking.serviceId) ?? "";
    const serviceEn = booking.serviceLabelEn(booking.serviceId);
    const url = whatsappUrl(
      digits,
      requestMessage(t.form.whatsappMessage, {
        name: name.trim().replace(/\s+/g, " "),
        phone: inText(phone.trim()),
        service: serviceEn && serviceEn !== service ? `${service} (${serviceEn})` : service,
        date: formatDay(booking.date),
      }),
    );
    openWhatsApp(url);
    setChatUrl(url);
    const first = name.trim().split(/\s+/)[0];
    setSuccess(fmt(t.form.whatsappSent, { name: first }));
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
      setError(t.form.errors.bookingMissing);
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
        setSuccess(fmt(t.form.sent, { name: first }));
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

      // The API answers in English: other languages go by its error code instead.
      const { invalid_payload, rate_limited, whatsapp_only } = t.form.errors;
      const byCode: Record<string, string> = { invalid_payload, rate_limited, whatsapp_only };
      const message = locale === DEFAULT_LOCALE ? body.error?.message : byCode[body.error?.code ?? ""];
      setError(message ?? fmt(t.form.errors.generic, { phone: inText(booking.phone) }));
    } catch {
      setError(fmt(t.form.errors.network, { phone: inText(booking.phone) }));
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: ContactField) => "input" + (fieldErrors.has(field) ? " is-error" : "");

  return (
    // Reveals with the "Visit us" block (it inherits hidden/show from the parent).
    <motion.form
      className="panel"
      id="contact-form"
      noValidate
      ref={booking.contactRef}
      onSubmit={onSubmit}
      variants={fadeUp}
    >
      <div className="field">
        <label htmlFor="name">{t.form.name}</label>
        <input
          ref={booking.nameRef}
          className={inputClass("name")}
          id="name"
          name="name"
          type="text"
          placeholder={t.form.namePlaceholder}
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
        <label htmlFor="phone">{t.form.phone}</label>
        <input
          className={inputClass("phone")}
          id="phone"
          name="phone"
          type="tel"
          placeholder={t.form.phonePlaceholder}
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
        {whatsapp ? t.form.sendWhatsApp : sending ? t.form.sending : t.form.send}
      </button>
      <p className={success ? "form-success is-visible" : "form-success"} role="status" aria-live="polite">
        {success}
        {success && chatUrl ? (
          <>
            {" "}
            <a className="form-success-link" href={chatUrl} target="_blank" rel="noopener noreferrer">
              {t.form.whatsappReopen}
            </a>
          </>
        ) : null}
      </p>
      <p className={error ? "form-error is-visible" : "form-error"} role="alert">
        {error}
      </p>
    </motion.form>
  );
}
