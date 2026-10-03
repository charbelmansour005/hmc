// Pure assembly of the public page model from DTOs. No I/O, no Mongoose.
import { CATEGORIES, CATEGORY_META } from "./categories";
import { DEFAULT_LOCALE, type Locale } from "./i18n/config";
import { localizeClinic, localizeDoctor, localizeService, localizeSettings } from "./i18n/content";
import type { Messages } from "./i18n/messages/en";
import type {
  BookingGroup,
  ClinicDTO,
  DoctorDTO,
  HomeContent,
  HomeSection,
  PublicServiceItem,
  ServiceDTO,
  SettingsDTO,
} from "./types";

type Sortable = { sortOrder: number; name: string };

export const bySortOrder = (a: Sortable, b: Sortable) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

/**
 * The page in one language: `locale` picks the translated content (falling
 * back to English field by field) and `t` is that language's wording.
 *
 * A section the admin has hidden (Settings.hiddenSections) is left out as if
 * it had no services: no section, no nav link, and its services are not
 * offered for booking. A card or clinic elsewhere that books one of them stays
 * on the page but no longer preselects anything.
 */
export function buildHomeContent(
  input: {
    services: ServiceDTO[];
    clinics: ClinicDTO[];
    doctors: DoctorDTO[];
    settings: SettingsDTO;
    reviewsEnabled: boolean;
  },
  locale: Locale,
  t: Messages,
): HomeContent {
  const hidden = new Set(input.settings.hiddenSections);
  // Sorted on the English names, so the order is the same in every language.
  const services = [...input.services].filter((s) => !hidden.has(s.category)).sort(bySortOrder);
  const bookable = new Map(services.filter((s) => !s.bookAsId).map((s) => [s.id, s]));

  // A card books its bookAs target when that target is bookable, else itself.
  const bookingIdFor = (s: ServiceDTO) =>
    s.bookAsId && bookable.has(s.bookAsId) ? s.bookAsId : s.id;

  const sections: HomeSection[] = [];
  const bookingGroups: BookingGroup[] = [];

  for (const category of CATEGORIES) {
    const meta = CATEGORY_META[category];
    const text = t.categories[category];
    const inCategory = services.filter((s) => s.category === category);
    const items: PublicServiceItem[] = inCategory.map((s) => ({
      ...localizeService(s, locale),
      bookingId: bookingIdFor(s),
    }));

    if (items.length > 0) {
      sections.push({
        category,
        heading: text.heading,
        lede: text.lede,
        navLabel: text.navLabel,
        anchor: meta.anchor,
        wide: Boolean(meta.wide),
        cards: items.filter((s) => s.display === "card"),
        features: items.filter((s) => s.display === "feature"),
      });
    }

    const options = inCategory
      .filter((s) => bookable.has(s.id))
      .map((s) => {
        const local = localizeService(s, locale);
        const english = localizeService(s, DEFAULT_LOCALE);
        return {
          id: s.id,
          label: local.bookingLabel ?? local.name,
          labelEn: english.bookingLabel ?? english.name,
        };
      });
    if (options.length > 0) bookingGroups.push({ label: text.optgroup, options });
  }

  const clinics = [...input.clinics]
    .sort(bySortOrder)
    .map((c) => ({ ...localizeClinic(c, locale), bookingId: bookable.has(c.serviceId) ? c.serviceId : "" }));

  return {
    settings: localizeSettings(input.settings, locale),
    reviewsEnabled: input.reviewsEnabled,
    sections,
    clinics,
    doctors: [...input.doctors].sort(bySortOrder).map((d) => localizeDoctor(d, locale)),
    bookingGroups,
    nav: [
      ...sections.map((s) => ({ href: `#${s.anchor}`, label: s.navLabel })),
      { href: "#visit", label: t.nav.visit },
    ],
    headerNav: [
      ...(sections.length > 0
        ? [{ href: "#services", label: t.nav.services, match: sections.map((s) => s.anchor) }]
        : []),
      ...(clinics.length > 0 ? [{ href: "#clinics", label: t.nav.clinics }] : []),
      ...(input.doctors.length > 0 ? [{ href: "#team", label: t.nav.team }] : []),
      { href: "#visit", label: t.nav.visit },
    ],
  };
}

/** "+961 4 520 065" -> "tel:+9614520065" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
