// Shared constants (safe for server, client and the seed script).

export const CATEGORIES = ["specialists", "nutrition", "dental", "esthetics", "movement"] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export const SERVICE_DISPLAYS = ["card", "feature"] as const;
export type ServiceDisplay = (typeof SERVICE_DISPLAYS)[number];

export const ACCENTS = ["teal", "green", "coral", "blue"] as const;
export type Accent = (typeof ACCENTS)[number];

export const APPOINTMENT_STATUSES = ["new", "contacted", "closed"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type CategoryMeta = {
  /** Section heading on the public page */
  heading: string;
  /** Optional subtitle under the heading */
  lede?: string;
  /** Section id and nav anchor */
  anchor: string;
  /** Label in the header/footer nav */
  navLabel: string;
  /** <optgroup> label in the booking dropdown */
  optgroup: string;
  /** Cards span the full width on phones (Movement, like Dedicated clinics) */
  wide?: boolean;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  specialists: {
    heading: "Our specialists",
    lede: "Choose a specialist to start your booking.",
    anchor: "specialists",
    navLabel: "Specialists",
    optgroup: "Specialists",
  },
  nutrition: {
    heading: "Nutrition, built around you",
    lede: "Personalized medical nutrition therapy with our dietitians.",
    anchor: "nutrition",
    navLabel: "Nutrition",
    optgroup: "Nutrition",
  },
  dental: {
    heading: "Dental care, done gently",
    anchor: "dental",
    navLabel: "Dental",
    optgroup: "Dental",
  },
  esthetics: {
    heading: "Esthetic & slimming clinic",
    anchor: "esthetics",
    navLabel: "Esthetics",
    optgroup: "Esthetics & slimming",
  },
  movement: {
    heading: "Move, recover, get stronger",
    anchor: "movement",
    navLabel: "Movement",
    optgroup: "Movement",
    wide: true,
  },
};

export const ACCENT_LABELS: Record<Accent, string> = {
  teal: "Teal",
  green: "Green",
  coral: "Coral",
  blue: "Blue",
};

/** Booking window offered on the public form (today + next 13 days, closed days skipped). */
export const BOOKING_DAYS = 14;

/** Days of the week the clinic is closed (0 = Sunday … 6 = Saturday); never offered for booking. */
export const CLOSED_WEEKDAYS: readonly number[] = [0, 6];

/** Appointment requests are deleted automatically after this many days. */
export const APPOINTMENT_RETENTION_DAYS = 90;

/**
 * Where the public booking form sends requests: straight to the clinic's
 * WhatsApp (nothing is stored), or into the CMS inbox (plus optional email).
 */
export const BOOKING_CHANNELS = ["whatsapp", "cms"] as const;
export type BookingChannel = (typeof BOOKING_CHANNELS)[number];

/** Most Google places the reviews section may combine (one API call each per load). */
export const MAX_GOOGLE_PLACES = 3;

/** The reviews section hides Google reviews rated below this (and says so). */
export const REVIEW_MIN_RATING = 4;
