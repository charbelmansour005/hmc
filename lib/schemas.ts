// Zod schemas shared by route handlers (authoritative) and admin forms (hints).
// Every schema is .strict(): unknown keys are rejected with a 400.
import { z } from "zod";
import {
  ACCENTS,
  APPOINTMENT_STATUSES,
  BOOKING_CHANNELS,
  CATEGORIES,
  MAX_GOOGLE_PLACES,
  SERVICE_DISPLAYS,
} from "./categories";
import type { TranslationLocale } from "./i18n/config";
import { isValidPhone, whatsappDigits } from "./phone";

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

export const objectIdString = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const sortOrder = z.coerce.number().int().min(0).max(9999);

// Phone numbers: digits with optional +, spaces, dashes, dots and parentheses; 7–15 digits.
export const phoneSchema = z.string().trim().max(24).refine(isValidPhone, "Enter a valid phone number");

// ------------------------------------------------------------ translations
// French and Arabic copies of an item's text, with the same limits as the
// English. Every field is optional: an empty one shows the English text on
// that language's page. A language left out of an update keeps what it had.
const translationsOf = <T extends z.ZodTypeAny>(copy: T) =>
  z.object({ fr: copy.optional(), ar: copy.optional() } satisfies Record<TranslationLocale, unknown>).strict();

const serviceText = z
  .object({
    name: optionalText(80),
    bookingLabel: optionalText(60),
    chip: optionalText(24),
    description: optionalText(200),
    tags: z.array(text(1, 20)).max(6).default([]),
    imageAlt: optionalText(140),
  })
  .strict();

const clinicText = z
  .object({
    name: optionalText(80),
    chip: optionalText(24),
    description: optionalText(200),
    imageAlt: optionalText(140),
  })
  .strict();

const doctorText = z
  .object({
    name: optionalText(80),
    specialty: optionalText(60),
    bio: optionalText(160),
    photoAlt: optionalText(140),
  })
  .strict();

const settingsText = z
  .object({
    address: optionalText(160),
    openingHours: optionalText(80),
  })
  .strict();

// ---------------------------------------------------------------- services
export const serviceBase = z
  .object({
    name: text(2, 80),
    bookingLabel: optionalText(60),
    category: z.enum(CATEGORIES),
    display: z.enum(SERVICE_DISPLAYS),
    chip: optionalText(24),
    description: optionalText(200),
    tags: z.array(text(1, 20)).max(6),
    imageAlt: text(3, 140),
    sortOrder,
    bookAsId: objectIdString.nullish().transform((v) => v ?? null),
    translations: translationsOf(serviceText).optional(),
  })
  .strict();

export const serviceCreateSchema = serviceBase.extend({ tags: serviceBase.shape.tags.default([]) }).strict();
export const serviceUpdateSchema = serviceBase.partial().strict();
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

// ----------------------------------------------------------------- clinics
export const clinicBase = z
  .object({
    name: text(2, 80),
    chip: text(1, 24),
    description: text(2, 200),
    imageAlt: text(3, 140),
    serviceId: objectIdString,
    sortOrder,
    translations: translationsOf(clinicText).optional(),
  })
  .strict();

export const clinicCreateSchema = clinicBase;
export const clinicUpdateSchema = clinicBase.partial().strict();
export type ClinicCreateInput = z.infer<typeof clinicCreateSchema>;
export type ClinicUpdateInput = z.infer<typeof clinicUpdateSchema>;

// ----------------------------------------------------------------- doctors
export const doctorBase = z
  .object({
    name: text(2, 80),
    specialty: text(2, 60),
    bio: z.string().trim().max(160),
    accent: z.enum(ACCENTS),
    photoAlt: optionalText(140),
    sortOrder,
    removePhoto: z.boolean().optional(),
    translations: translationsOf(doctorText).optional(),
  })
  .strict();

export const doctorCreateSchema = doctorBase.extend({ bio: doctorBase.shape.bio.default("") }).strict();
export const doctorUpdateSchema = doctorBase.partial().strict();
export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;

// ---------------------------------------------------------------- settings
const WHATSAPP_FORMAT = "Use the international format with the country code, e.g. +961 4 520 065.";

export const settingsBase = z
  .object({
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .max(120)
      .email("Enter a valid email address")
      .nullish()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    address: optionalText(160),
    openingHours: optionalText(80),
    mapQuery: text(2, 120),
    bookingChannel: z.enum(BOOKING_CHANNELS),
    whatsapp: z
      .string()
      .trim()
      .max(24)
      .refine((v) => v === "" || whatsappDigits(v) !== null, WHATSAPP_FORMAT)
      .nullish()
      .transform((v) => (v ? v : null)),
    googlePlaceIds: z
      .array(z.string().trim().regex(/^[A-Za-z0-9_-]{10,256}$/, "That doesn't look like a Google Place ID."))
      .max(MAX_GOOGLE_PLACES, `Add at most ${MAX_GOOGLE_PLACES} places.`)
      .transform((ids) => [...new Set(ids)]),
    /** Service sections hidden from the website (CMS → Services). */
    hiddenSections: z
      .array(z.enum(CATEGORIES))
      .max(CATEGORIES.length * 2)
      .transform((sections) => [...new Set(sections)])
      .default([]),
    translations: translationsOf(settingsText).default({}),
  })
  .strict();

export const settingsUpdateSchema = settingsBase.partial().strict();

/** The whole settings document, checked after a patch is merged (rule 8). */
export const settingsSchema = settingsBase.superRefine((s, ctx) => {
  // WhatsApp needs a country code; with no separate number the phone is used.
  if (s.bookingChannel === "whatsapp" && whatsappDigits(s.whatsapp ?? s.phone) === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["whatsapp"], message: WHATSAPP_FORMAT });
  }
});
export type SettingsInput = z.infer<typeof settingsBase>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

// ------------------------------------------------------------ appointments
// Only name, phone, preferred date and service. No free-text or clinical
// fields: .strict() turns any extra key (e.g. "symptoms") into a 400.
export const appointmentInput = z
  .object({
    name: text(2, 80),
    phone: phoneSchema,
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    serviceId: objectIdString,
    /** Honeypot. Real visitors never see or fill it. */
    website: z.string().max(200).optional(),
  })
  .strict();
export type AppointmentInput = z.infer<typeof appointmentInput>;

export const appointmentStatusInput = z.object({ status: z.enum(APPOINTMENT_STATUSES) }).strict();

export const appointmentListQuery = z
  .object({
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
  })
  .strict();

// ------------------------------------------------------------------- auth
export const loginInput = z
  .object({
    username: text(1, 64),
    password: z.string().min(1).max(128),
  })
  .strict();
