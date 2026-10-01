// Plain DTOs: the only shapes that cross from the data layer into components.
// Every id is a string; every date is an ISO string. No Mongoose types here.
import type { Accent, AppointmentStatus, BookingChannel, Category, ServiceDisplay } from "./categories";

export type ImageStorage = "external" | "local" | "blob";

export type ImageDTO = {
  url: string;
  alt: string;
  storage: ImageStorage;
};

export type ServiceDTO = {
  id: string;
  slug: string;
  category: Category;
  display: ServiceDisplay;
  name: string;
  bookingLabel: string | null;
  chip: string | null;
  description: string | null;
  tags: string[];
  image: ImageDTO;
  bookAsId: string | null;
  sortOrder: number;
  updatedAt: string | null;
};

export type ClinicDTO = {
  id: string;
  slug: string;
  name: string;
  chip: string;
  description: string;
  image: ImageDTO;
  serviceId: string;
  sortOrder: number;
  updatedAt: string | null;
};

export type DoctorDTO = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  photo: ImageDTO | null;
  accent: Accent;
  sortOrder: number;
  updatedAt: string | null;
};

export type SettingsDTO = {
  phone: string;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  mapQuery: string;
  bookingChannel: BookingChannel;
  whatsapp: string | null;
  googlePlaceIds: string[];
  updatedAt: string | null;
};

export type AppointmentDTO = {
  id: string;
  name: string;
  phone: string;
  preferredDate: string;
  serviceId: string | null;
  serviceName: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type BookingOption = { id: string; label: string };
export type BookingGroup = { label: string; options: BookingOption[] };

/** A card or feature on the public page, with the service id it books. */
export type PublicServiceItem = ServiceDTO & { bookingId: string };
export type PublicClinicItem = ClinicDTO & { bookingId: string };

export type HomeSection = {
  category: Category;
  heading: string;
  lede: string | null;
  anchor: string;
  wide: boolean;
  cards: PublicServiceItem[];
  features: PublicServiceItem[];
};

export type NavLink = {
  href: string;
  label: string;
  /** Section ids that also mark this link as the one being read (header only). */
  match?: string[];
};

/** One Google review, reduced to what the reviews section renders. */
export type GoogleReviewDTO = {
  /** Google's resource name for the review; stable, used as the React key. */
  id: string;
  author: string;
  authorUrl: string | null;
  authorPhoto: string | null;
  rating: number;
  /** Google's own wording, e.g. "2 weeks ago". */
  relativeTime: string;
  publishTime: string | null;
  text: string;
  /** Language of `text` (BCP-47), for lang/dir. */
  lang: string | null;
  /** Set only when Google translated `text`: the words as the author wrote them. */
  original: { text: string; lang: string | null } | null;
  /** The review on Google Maps (required by Google's attribution policy). */
  url: string | null;
};

export type GoogleReviewsDTO = {
  /** Average rating across the configured places, weighted by review count. */
  rating: number | null;
  total: number;
  reviewsUrl: string | null;
  writeReviewUrl: string | null;
  reviews: GoogleReviewDTO[];
};

export type HomeContent = {
  settings: SettingsDTO;
  /** The reviews section renders only when an API key and a Place ID are configured. */
  reviewsEnabled: boolean;
  sections: HomeSection[];
  clinics: PublicClinicItem[];
  doctors: DoctorDTO[];
  bookingGroups: BookingGroup[];
  /** Full section list (footer). */
  nav: NavLink[];
  /** The shorter header nav: every service section is grouped under "Services". */
  headerNav: NavLink[];
};
