import "server-only";
import type { Types } from "mongoose";
import type { ImageRef } from "@/models/_image";
import type { AdminDoc } from "@/models/Admin";
import type { AppointmentRequestDoc } from "@/models/AppointmentRequest";
import type { ClinicDoc } from "@/models/Clinic";
import type { DoctorDoc } from "@/models/Doctor";
import type { ServiceDoc } from "@/models/Service";
import type { SiteSettingsDoc } from "@/models/SiteSettings";
import type { StoredTranslations } from "@/models/_translations";
import { isCategory } from "./categories";
import { TRANSLATION_LOCALES } from "./i18n/config";
import type {
  AppointmentDTO,
  ClinicDTO,
  ClinicText,
  DoctorDTO,
  DoctorText,
  ImageDTO,
  ServiceDTO,
  ServiceText,
  SettingsDTO,
  SettingsText,
  Translations,
} from "./types";

// Rule 1: Mongoose documents never leave the data layer. Every read goes
// through .lean() and one of these mappers, which turn ObjectIds into
// strings and Dates into ISO strings.

const id = (value: Types.ObjectId | string): string => String(value);
const iso = (value: Date | null | undefined): string | null => (value ? new Date(value).toISOString() : null);

const text = (value: string | null | undefined): string | null => (value ? value : null);

// Translations always come out complete: every language present, every field
// null (or no tags) when nothing was saved. A document written before
// translations existed therefore reads as "not translated".
function toTranslations<S, T>(stored: StoredTranslations<S> | undefined, pick: (copy: Partial<S>) => T): Translations<T> {
  return Object.fromEntries(
    TRANSLATION_LOCALES.map((locale) => [locale, pick(stored?.[locale] ?? {})]),
  ) as Translations<T>;
}

export const toServiceTranslations = (stored: StoredTranslations<ServiceText> | undefined) =>
  toTranslations<ServiceText, ServiceText>(stored, (copy) => ({
    name: text(copy.name),
    bookingLabel: text(copy.bookingLabel),
    chip: text(copy.chip),
    description: text(copy.description),
    tags: [...(copy.tags ?? [])],
    imageAlt: text(copy.imageAlt),
  }));

export const toClinicTranslations = (stored: StoredTranslations<ClinicText> | undefined) =>
  toTranslations<ClinicText, ClinicText>(stored, (copy) => ({
    name: text(copy.name),
    chip: text(copy.chip),
    description: text(copy.description),
    imageAlt: text(copy.imageAlt),
  }));

export const toDoctorTranslations = (stored: StoredTranslations<DoctorText> | undefined) =>
  toTranslations<DoctorText, DoctorText>(stored, (copy) => ({
    name: text(copy.name),
    specialty: text(copy.specialty),
    bio: text(copy.bio),
    photoAlt: text(copy.photoAlt),
  }));

export const toSettingsTranslations = (stored: StoredTranslations<SettingsText> | undefined) =>
  toTranslations<SettingsText, SettingsText>(stored, (copy) => ({
    address: text(copy.address),
    openingHours: text(copy.openingHours),
  }));

export function toImageDTO(ref: ImageRef): ImageDTO {
  return { url: ref.url, alt: ref.alt, storage: ref.storage };
}

export function toServiceDTO(doc: ServiceDoc): ServiceDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    category: doc.category,
    display: doc.display,
    name: doc.name,
    bookingLabel: doc.bookingLabel ?? null,
    chip: doc.chip ?? null,
    description: doc.description ?? null,
    tags: [...(doc.tags ?? [])],
    image: toImageDTO(doc.image),
    bookAsId: doc.bookAs ? id(doc.bookAs) : null,
    sortOrder: doc.sortOrder,
    translations: toServiceTranslations(doc.translations),
    updatedAt: iso(doc.updatedAt),
  };
}

export function toClinicDTO(doc: ClinicDoc): ClinicDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    name: doc.name,
    chip: doc.chip,
    description: doc.description,
    image: toImageDTO(doc.image),
    serviceId: id(doc.service),
    sortOrder: doc.sortOrder,
    translations: toClinicTranslations(doc.translations),
    updatedAt: iso(doc.updatedAt),
  };
}

export function toDoctorDTO(doc: DoctorDoc): DoctorDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    name: doc.name,
    specialty: doc.specialty,
    bio: doc.bio ?? "",
    photo: doc.photo ? toImageDTO(doc.photo) : null,
    accent: doc.accent,
    sortOrder: doc.sortOrder,
    translations: toDoctorTranslations(doc.translations),
    updatedAt: iso(doc.updatedAt),
  };
}

export function toSettingsDTO(doc: SiteSettingsDoc): SettingsDTO {
  return {
    phone: doc.phone,
    email: doc.email ?? null,
    address: doc.address ?? null,
    openingHours: doc.openingHours ?? null,
    mapQuery: doc.mapQuery,
    bookingChannel: doc.bookingChannel ?? "whatsapp",
    whatsapp: doc.whatsapp ?? null,
    googlePlaceIds: [...(doc.googlePlaceIds ?? [])],
    hiddenSections: (doc.hiddenSections ?? []).filter(isCategory),
    translations: toSettingsTranslations(doc.translations),
    updatedAt: iso(doc.updatedAt),
  };
}

export function toAppointmentDTO(doc: AppointmentRequestDoc): AppointmentDTO {
  return {
    id: id(doc._id),
    name: doc.name,
    phone: doc.phone,
    preferredDate: doc.preferredDate,
    serviceId: doc.service ? id(doc.service) : null,
    serviceName: doc.serviceName,
    status: doc.status,
    createdAt: iso(doc.createdAt) ?? new Date(0).toISOString(),
  };
}

export type AdminSession = { adminId: string; username: string };

export function toAdminSession(doc: AdminDoc): AdminSession {
  return { adminId: id(doc._id), username: doc.username };
}
