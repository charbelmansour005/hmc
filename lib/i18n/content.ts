// Picks the text of CMS content for one language. Pure: no I/O, no Mongoose.
// Every field falls back to English on its own, so a half-translated item
// shows what it has rather than nothing.
import type {
  ClinicDTO,
  DoctorDTO,
  PublicClinic,
  PublicDoctor,
  PublicService,
  PublicSettings,
  ServiceDTO,
  SettingsDTO,
} from "../types";
import { DEFAULT_LOCALE, type Locale } from "./config";

export function localizeService(service: ServiceDTO, locale: Locale): PublicService {
  const { translations, ...base } = service;
  if (locale === DEFAULT_LOCALE) return base;
  const text = translations[locale];
  return {
    ...base,
    name: text.name ?? base.name,
    // The dropdown shows bookingLabel ?? name: a translated name beats the English label.
    bookingLabel: text.bookingLabel ?? (text.name ? null : base.bookingLabel),
    chip: text.chip ?? base.chip,
    description: text.description ?? base.description,
    tags: text.tags.length > 0 ? text.tags : base.tags,
    image: { ...base.image, alt: text.imageAlt ?? base.image.alt },
  };
}

export function localizeClinic(clinic: ClinicDTO, locale: Locale): PublicClinic {
  const { translations, ...base } = clinic;
  if (locale === DEFAULT_LOCALE) return base;
  const text = translations[locale];
  return {
    ...base,
    name: text.name ?? base.name,
    chip: text.chip ?? base.chip,
    description: text.description ?? base.description,
    image: { ...base.image, alt: text.imageAlt ?? base.image.alt },
  };
}

export function localizeDoctor(doctor: DoctorDTO, locale: Locale): PublicDoctor {
  const { translations, ...base } = doctor;
  if (locale === DEFAULT_LOCALE) return base;
  const text = translations[locale];
  return {
    ...base,
    name: text.name ?? base.name,
    specialty: text.specialty ?? base.specialty,
    bio: text.bio ?? base.bio,
    photo: base.photo ? { ...base.photo, alt: text.photoAlt ?? base.photo.alt } : null,
  };
}

export function localizeSettings(settings: SettingsDTO, locale: Locale): PublicSettings {
  const { translations, ...base } = settings;
  if (locale === DEFAULT_LOCALE) return base;
  const text = translations[locale];
  return {
    ...base,
    address: text.address ?? base.address,
    openingHours: text.openingHours ?? base.openingHours,
  };
}
