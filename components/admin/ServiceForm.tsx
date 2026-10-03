"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CATEGORY_META, type Category, type ServiceDisplay } from "@/lib/categories";
import { TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n/config";
import type { ServiceDTO } from "@/lib/types";
import { sendMultipart, type FieldErrors } from "./api";
import { ImageField } from "./ImageField";
import { splitList, TranslationsCard, translationValues, type TranslationField } from "./TranslationsCard";
import { buttonClass, Card, Field, inputClass, Notice } from "./ui";

type BookableOption = { id: string; label: string; group: string };

export function ServiceForm({
  service,
  bookable,
  defaultCategory,
}: {
  service: ServiceDTO | null;
  bookable: BookableOption[];
  defaultCategory?: Category;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>(service?.category ?? defaultCategory ?? "specialists");
  const [display, setDisplay] = useState<ServiceDisplay>(service?.display ?? "card");
  const [name, setName] = useState(service?.name ?? "");
  const [chip, setChip] = useState(service?.chip ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [tags, setTags] = useState((service?.tags ?? []).join(", "));
  const [booksOther, setBooksOther] = useState(Boolean(service?.bookAsId));
  const [bookAsId, setBookAsId] = useState(service?.bookAsId ?? "");
  const [bookingLabel, setBookingLabel] = useState(service?.bookingLabel ?? "");
  const [imageAlt, setImageAlt] = useState(service?.image.alt ?? "");
  const [sortOrder, setSortOrder] = useState(String(service?.sortOrder ?? 100));
  const [translations, setTranslations] = useState(() =>
    translationValues(service?.translations, ["name", "chip", "tags", "description", "bookingLabel", "imageAlt"]),
  );
  const [image, setImage] = useState<File | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const targets = bookable.filter((b) => b.id !== service?.id);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const payload = {
      name,
      category,
      display,
      chip: chip || null,
      description: description || null,
      tags: display === "feature" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      bookingLabel: booksOther ? null : bookingLabel || null,
      bookAsId: booksOther ? bookAsId || null : null,
      imageAlt,
      sortOrder: Number(sortOrder),
      // Same rules as the English above: tags on feature cards only, no dropdown name for a card that books another service.
      translations: Object.fromEntries(
        TRANSLATION_LOCALES.map((locale) => {
          const text = translations[locale];
          return [
            locale,
            {
              name: text.name || null,
              chip: text.chip || null,
              description: text.description || null,
              tags: display === "feature" ? splitList(text.tags) : [],
              bookingLabel: booksOther ? null : text.bookingLabel || null,
              imageAlt: text.imageAlt || null,
            },
          ];
        }),
      ),
    };
    const result = service
      ? await sendMultipart<ServiceDTO>(`/api/admin/services/${service.id}`, "PATCH", payload, image)
      : await sendMultipart<ServiceDTO>("/api/admin/services", "POST", payload, image);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      setFields(result.fields);
      return;
    }
    router.push("/admin/services");
    router.refresh();
  };

  const err = (key: string) => fields[key];

  const onTranslation = (locale: TranslationLocale, key: string, value: string) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));

  // The translatable text, in the order it appears above; it follows the choices made there.
  const translationFields: TranslationField[] = [
    { key: "name", label: "Name", english: name, maxLength: 80 },
    display === "card"
      ? { key: "chip", label: "Chip label", english: chip, maxLength: 24 }
      : { key: "tags", label: "Tags (comma-separated)", english: tags },
    { key: "description", label: "Short description", english: description, maxLength: 200, multiline: true },
    ...(booksOther
      ? []
      : [{ key: "bookingLabel", label: "Name in the booking dropdown", english: bookingLabel || name, maxLength: 60 }]),
    { key: "imageAlt", label: "Photo description (alt text)", english: imageAlt, maxLength: 140 },
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Card className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section" htmlFor="category" error={err("category")}>
            <select id="category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].heading}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Shown as"
            htmlFor="display"
            error={err("display")}
            hint="Small card in the grid, or a large feature card with a button."
          >
            <select id="display" className={inputClass} value={display} onChange={(e) => setDisplay(e.target.value as ServiceDisplay)}>
              <option value="card">Card</option>
              <option value="feature">Feature card</option>
            </select>
          </Field>
        </div>

        <Field label="Name" htmlFor="name" error={err("name")} hint="The card heading, e.g. “Cardiologist”.">
          <input id="name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(err("name"))} />
        </Field>

        {display === "card" ? (
          <Field label="Chip label" htmlFor="chip" error={err("chip")} hint="The small tag on the photo, e.g. “Cardiology”.">
            <input id="chip" className={inputClass} value={chip} maxLength={24} onChange={(e) => setChip(e.target.value)} aria-invalid={Boolean(err("chip"))} />
          </Field>
        ) : (
          <Field label="Tags" htmlFor="tags" error={err("tags")} hint="Optional, comma-separated, e.g. “Hair, Skin, Joints”.">
            <input id="tags" className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        )}

        <Field label="Short description" htmlFor="description" error={err("description")} hint="One line, up to 200 characters.">
          <textarea
            id="description"
            rows={2}
            className={inputClass}
            value={description}
            maxLength={200}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </Card>

      <Card className="grid gap-5">
        <h2 className="text-lg text-ink">Booking</h2>
        <div className="grid gap-3 text-sm text-ink-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="booking" checked={!booksOther} onChange={() => setBooksOther(false)} />
            Visitors can book this service (it appears in the booking dropdown)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="booking" checked={booksOther} onChange={() => setBooksOther(true)} />
            Clicking this card books a different service
          </label>
        </div>
        {booksOther ? (
          <Field label="Books" htmlFor="bookAsId" error={err("bookAsId")}>
            <select id="bookAsId" className={inputClass} value={bookAsId} onChange={(e) => setBookAsId(e.target.value)} aria-invalid={Boolean(err("bookAsId"))}>
              <option value="">Choose a service…</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.group} — {t.label}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field
            label="Name in the booking dropdown"
            htmlFor="bookingLabel"
            error={err("bookingLabel")}
            hint="Optional. Leave empty to use the name above."
          >
            <input id="bookingLabel" className={inputClass} value={bookingLabel} maxLength={60} placeholder={name} onChange={(e) => setBookingLabel(e.target.value)} />
          </Field>
        )}
      </Card>

      <Card className="grid gap-5">
        <ImageField
          id="image"
          label="Photo"
          currentUrl={service?.image.url ?? null}
          file={image}
          onFile={setImage}
          error={err("image")}
          required
          aspect={display === "feature" ? "16 / 7" : "16 / 11"}
        />
        <Field label="Photo description (alt text)" htmlFor="imageAlt" error={err("imageAlt")} hint="Describes the photo for screen readers.">
          <input id="imageAlt" className={inputClass} value={imageAlt} maxLength={140} onChange={(e) => setImageAlt(e.target.value)} aria-invalid={Boolean(err("imageAlt"))} />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")} hint="Lower numbers appear first within the section.">
          <input id="sortOrder" type="number" min={0} max={9999} className={`${inputClass} max-w-40`} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </Field>
      </Card>

      <TranslationsCard fields={translationFields} values={translations} onChange={onTranslation} error={err} />

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClass.primary} disabled={busy}>
          {busy ? "Saving…" : service ? "Save changes" : "Create service"}
        </button>
        <button type="button" className={buttonClass.secondary} onClick={() => router.push("/admin/services")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
