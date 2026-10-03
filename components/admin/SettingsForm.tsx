"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAX_GOOGLE_PLACES, type BookingChannel } from "@/lib/categories";
import { TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n/config";
import type { SettingsDTO } from "@/lib/types";
import { sendJson, type FieldErrors } from "./api";
import { TranslationsCard, translationValues, type TranslationField } from "./TranslationsCard";
import { buttonClass, Card, Field, inputClass, Notice } from "./ui";

/** One Place ID per line (commas work too). */
const parsePlaceIds = (value: string) =>
  value
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);

export function SettingsForm({ settings, reviewsKeySet }: { settings: SettingsDTO; reviewsKeySet: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [openingHours, setOpeningHours] = useState(settings.openingHours ?? "");
  const [mapQuery, setMapQuery] = useState(settings.mapQuery);
  const [bookingChannel, setBookingChannel] = useState<BookingChannel>(settings.bookingChannel);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp ?? "");
  const [placeIds, setPlaceIds] = useState(settings.googlePlaceIds.join("\n"));
  const [translations, setTranslations] = useState(() =>
    translationValues(settings.translations, ["address", "openingHours"]),
  );
  const [fields, setFields] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setFields({});
    const result = await sendJson<SettingsDTO>("/api/admin/settings", "PATCH", {
      phone,
      email: email || null,
      address: address || null,
      openingHours: openingHours || null,
      mapQuery,
      bookingChannel,
      whatsapp: whatsapp || null,
      googlePlaceIds: parsePlaceIds(placeIds),
      translations: Object.fromEntries(
        TRANSLATION_LOCALES.map((locale) => {
          const text = translations[locale];
          return [locale, { address: text.address || null, openingHours: text.openingHours || null }];
        }),
      ),
    });
    setBusy(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      setFields(result.fields);
      return;
    }
    setMessage({ tone: "success", text: "Saved. The website shows the new settings on the next page load." });
    router.refresh();
  };

  // zod reports array items as "googlePlaceIds.0"; show the first one on the field.
  const err = (key: string) =>
    fields[key] ?? Object.entries(fields).find(([k]) => k.startsWith(`${key}.`))?.[1];

  const onTranslation = (locale: TranslationLocale, key: string, value: string) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));

  const translationFields: TranslationField[] = [
    { key: "address", label: "Address", english: address, maxLength: 160 },
    { key: "openingHours", label: "Opening hours", english: openingHours, maxLength: 80 },
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Card className="grid gap-5">
        <h2 className="text-lg text-ink">Contact &amp; hours</h2>
        <Field label="Phone" htmlFor="phone" error={err("phone")} hint="Shown in the hero “Call” button, the contact card and the footer.">
          <input id="phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(err("phone"))} />
        </Field>
        <Field label="Email" htmlFor="email" error={err("email")} hint="Optional. Shown in the contact card when set; never in the footer.">
          <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(err("email"))} />
        </Field>
        <Field label="Address" htmlFor="address" error={err("address")} hint="Leave empty to show the [Address] placeholder.">
          <input id="address" className={inputClass} value={address} maxLength={160} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field
          label="Opening hours"
          htmlFor="openingHours"
          error={err("openingHours")}
          hint="E.g. “Mon–Fri, 8:30 AM – 6:00 PM · Sat & Sun closed”; each part between “·” gets its own line. Shown in the hero strip and the contact card."
        >
          <input id="openingHours" className={inputClass} value={openingHours} maxLength={80} onChange={(e) => setOpeningHours(e.target.value)} />
        </Field>
        <Field label="Map location" htmlFor="mapQuery" error={err("mapQuery")} hint="A place name, e.g. “Naccache, Lebanon”, or exact coordinates copied from Google Maps, e.g. “33.9228, 35.5971”.">
          <input id="mapQuery" className={inputClass} value={mapQuery} maxLength={120} onChange={(e) => setMapQuery(e.target.value)} aria-invalid={Boolean(err("mapQuery"))} />
        </Field>
      </Card>

      <TranslationsCard fields={translationFields} values={translations} onChange={onTranslation} error={err} />

      <Card className="grid gap-5">
        <h2 className="text-lg text-ink">Appointment requests</h2>
        <fieldset className="grid gap-3 text-sm text-ink-2">
          <legend className="sr-only">Where appointment requests go</legend>
          <label className="flex items-start gap-2">
            <input type="radio" name="bookingChannel" className="mt-1" checked={bookingChannel === "whatsapp"} onChange={() => setBookingChannel("whatsapp")} />
            <span>
              <span className="font-medium text-ink">WhatsApp</span> — the “Visit us” form opens a WhatsApp chat with the
              request filled in, ready for the patient to send. Nothing is saved on the website.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="bookingChannel" className="mt-1" checked={bookingChannel === "cms"} onChange={() => setBookingChannel("cms")} />
            <span>
              <span className="font-medium text-ink">CMS inbox</span> — requests are saved under Appointments (and
              emailed, if email is set up on the server).
            </span>
          </label>
        </fieldset>
        <Field
          label="WhatsApp number"
          htmlFor="whatsapp"
          error={err("whatsapp")}
          hint="Leave empty to use the phone number above. Include the country code, e.g. +961 4 520 065."
        >
          <input
            id="whatsapp"
            type="tel"
            className={inputClass}
            value={whatsapp}
            maxLength={24}
            placeholder={phone}
            onChange={(e) => setWhatsapp(e.target.value)}
            aria-invalid={Boolean(err("whatsapp"))}
          />
        </Field>
      </Card>

      <Card className="grid gap-5">
        <h2 className="text-lg text-ink">Google reviews</h2>
        <Field
          label="Google Place IDs"
          htmlFor="googlePlaceIds"
          error={err("googlePlaceIds")}
          hint={
            <>
              One per line, up to {MAX_GOOGLE_PLACES}; each adds one billed Google request per page view that reaches the
              section. Find an ID with{" "}
              <a
                className="font-semibold text-teal hover:underline"
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google’s Place ID Finder
              </a>
              . Leave empty to hide the reviews section.
            </>
          }
        >
          <textarea
            id="googlePlaceIds"
            rows={2}
            spellCheck={false}
            className={`${inputClass} font-mono`}
            value={placeIds}
            onChange={(e) => setPlaceIds(e.target.value)}
            aria-invalid={Boolean(err("googlePlaceIds"))}
          />
        </Field>
        <p className="text-xs text-muted">
          Server API key (<code>GOOGLE_PLACES_API_KEY</code>):{" "}
          {reviewsKeySet ? (
            <span className="font-semibold text-teal">set</span>
          ) : (
            <span className="font-semibold text-danger">not set — the reviews section stays hidden</span>
          )}
        </p>
      </Card>

      <div>
        <button type="submit" className={buttonClass.primary} disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
