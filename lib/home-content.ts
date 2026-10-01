// Pure assembly of the public page model from DTOs. No I/O, no Mongoose.
import { CATEGORIES, CATEGORY_META } from "./categories";
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

export function buildHomeContent(input: {
  services: ServiceDTO[];
  clinics: ClinicDTO[];
  doctors: DoctorDTO[];
  settings: SettingsDTO;
  reviewsEnabled: boolean;
}): HomeContent {
  const services = [...input.services].sort(bySortOrder);
  const bookable = new Map(services.filter((s) => !s.bookAsId).map((s) => [s.id, s]));

  // A card books its bookAs target when that target is bookable, else itself.
  const bookingIdFor = (s: ServiceDTO) =>
    s.bookAsId && bookable.has(s.bookAsId) ? s.bookAsId : s.id;

  const sections: HomeSection[] = [];
  const bookingGroups: BookingGroup[] = [];

  for (const category of CATEGORIES) {
    const meta = CATEGORY_META[category];
    const inCategory: PublicServiceItem[] = services
      .filter((s) => s.category === category)
      .map((s) => ({ ...s, bookingId: bookingIdFor(s) }));

    if (inCategory.length > 0) {
      sections.push({
        category,
        heading: meta.heading,
        lede: meta.lede ?? null,
        anchor: meta.anchor,
        wide: Boolean(meta.wide),
        cards: inCategory.filter((s) => s.display === "card"),
        features: inCategory.filter((s) => s.display === "feature"),
      });
    }

    const options = inCategory
      .filter((s) => bookable.has(s.id))
      .map((s) => ({ id: s.id, label: s.bookingLabel ?? s.name }));
    if (options.length > 0) bookingGroups.push({ label: meta.optgroup, options });
  }

  const clinics = [...input.clinics]
    .sort(bySortOrder)
    .map((c) => ({ ...c, bookingId: bookable.has(c.serviceId) ? c.serviceId : "" }));

  return {
    settings: input.settings,
    reviewsEnabled: input.reviewsEnabled,
    sections,
    clinics,
    doctors: [...input.doctors].sort(bySortOrder),
    bookingGroups,
    nav: [
      ...sections.map((s) => ({ href: `#${s.anchor}`, label: CATEGORY_META[s.category].navLabel })),
      { href: "#visit", label: "Visit us" },
    ],
    headerNav: [
      ...(sections.length > 0
        ? [{ href: "#services", label: "Services", match: sections.map((s) => s.anchor) }]
        : []),
      ...(clinics.length > 0 ? [{ href: "#clinics", label: "Clinics" }] : []),
      ...(input.doctors.length > 0 ? [{ href: "#team", label: "Team" }] : []),
      { href: "#visit", label: "Visit us" },
    ],
  };
}

/** "+961 4 520 065" -> "tel:+9614520065" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
