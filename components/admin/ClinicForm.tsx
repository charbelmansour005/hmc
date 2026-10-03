"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n/config";
import type { ClinicDTO } from "@/lib/types";
import { sendMultipart, type FieldErrors } from "./api";
import { ImageField } from "./ImageField";
import { TranslationsCard, translationValues, type TranslationField } from "./TranslationsCard";
import { buttonClass, Card, Field, inputClass, Notice } from "./ui";

type BookableOption = { id: string; label: string; group: string };

export function ClinicForm({ clinic, bookable }: { clinic: ClinicDTO | null; bookable: BookableOption[] }) {
  const router = useRouter();
  const [name, setName] = useState(clinic?.name ?? "");
  const [chip, setChip] = useState(clinic?.chip ?? "");
  const [description, setDescription] = useState(clinic?.description ?? "");
  const [serviceId, setServiceId] = useState(clinic?.serviceId ?? "");
  const [imageAlt, setImageAlt] = useState(clinic?.image.alt ?? "");
  const [sortOrder, setSortOrder] = useState(String(clinic?.sortOrder ?? 100));
  const [translations, setTranslations] = useState(() =>
    translationValues(clinic?.translations, ["name", "chip", "description", "imageAlt"]),
  );
  const [image, setImage] = useState<File | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const payload = {
      name,
      chip,
      description,
      serviceId,
      imageAlt,
      sortOrder: Number(sortOrder),
      translations: Object.fromEntries(
        TRANSLATION_LOCALES.map((locale) => {
          const text = translations[locale];
          return [
            locale,
            {
              name: text.name || null,
              chip: text.chip || null,
              description: text.description || null,
              imageAlt: text.imageAlt || null,
            },
          ];
        }),
      ),
    };
    const result = clinic
      ? await sendMultipart<ClinicDTO>(`/api/admin/clinics/${clinic.id}`, "PATCH", payload, image)
      : await sendMultipart<ClinicDTO>("/api/admin/clinics", "POST", payload, image);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      setFields(result.fields);
      return;
    }
    router.push("/admin/clinics");
    router.refresh();
  };

  const err = (key: string) => fields[key];

  const onTranslation = (locale: TranslationLocale, key: string, value: string) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));

  const translationFields: TranslationField[] = [
    { key: "name", label: "Name", english: name, maxLength: 80 },
    { key: "chip", label: "Chip label", english: chip, maxLength: 24 },
    { key: "description", label: "Short description", english: description, maxLength: 200, multiline: true },
    { key: "imageAlt", label: "Photo description (alt text)", english: imageAlt, maxLength: 140 },
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Card className="grid gap-5">
        <Field label="Name" htmlFor="name" error={err("name")} hint="e.g. “Clinical Psychology Clinic”.">
          <input id="name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(err("name"))} />
        </Field>
        <Field label="Chip label" htmlFor="chip" error={err("chip")} hint="The small tag on the photo, e.g. “Psychology”.">
          <input id="chip" className={inputClass} value={chip} maxLength={24} onChange={(e) => setChip(e.target.value)} aria-invalid={Boolean(err("chip"))} />
        </Field>
        <Field label="Short description" htmlFor="description" error={err("description")}>
          <textarea id="description" rows={2} className={inputClass} value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} aria-invalid={Boolean(err("description"))} />
        </Field>
        <Field label="Books" htmlFor="serviceId" error={err("serviceId")} hint="Clicking the clinic card preselects this service in the booking form.">
          <select id="serviceId" className={inputClass} value={serviceId} onChange={(e) => setServiceId(e.target.value)} aria-invalid={Boolean(err("serviceId"))}>
            <option value="">Choose a service…</option>
            {bookable.map((b) => (
              <option key={b.id} value={b.id}>
                {b.group} — {b.label}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card className="grid gap-5">
        <ImageField id="image" label="Photo" currentUrl={clinic?.image.url ?? null} file={image} onFile={setImage} error={err("image")} required />
        <Field label="Photo description (alt text)" htmlFor="imageAlt" error={err("imageAlt")}>
          <input id="imageAlt" className={inputClass} value={imageAlt} maxLength={140} onChange={(e) => setImageAlt(e.target.value)} aria-invalid={Boolean(err("imageAlt"))} />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")} hint="Lower numbers appear first.">
          <input id="sortOrder" type="number" min={0} max={9999} className={`${inputClass} max-w-40`} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </Field>
      </Card>

      <TranslationsCard fields={translationFields} values={translations} onChange={onTranslation} error={err} />

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClass.primary} disabled={busy}>
          {busy ? "Saving…" : clinic ? "Save changes" : "Create clinic"}
        </button>
        <button type="button" className={buttonClass.secondary} onClick={() => router.push("/admin/clinics")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
