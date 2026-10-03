// English: the source wording of the public site. `Messages` is derived from
// this object, so fr.ts and ar.ts fail the type check if a key is missing.
// Placeholders are written {like this}.
import { CATEGORIES, CATEGORY_META, type Category } from "../../categories";
import type { Plural } from "../format";

export type CategoryText = {
  /** Section heading */
  heading: string;
  /** Optional subtitle under the heading */
  lede: string | null;
  /** Label in the nav and the hero directory */
  navLabel: string;
  /** Group label in the booking dropdown */
  optgroup: string;
};

// Kept in lib/categories.ts, where the CMS also reads them.
const categories = Object.fromEntries(
  CATEGORIES.map((category) => {
    const meta = CATEGORY_META[category];
    return [category, { heading: meta.heading, lede: meta.lede ?? null, navLabel: meta.navLabel, optgroup: meta.optgroup }];
  }),
) as Record<Category, CategoryText>;

const plural = (forms: Plural): Plural => forms;

export const en = {
  meta: {
    title: "Hajj Medical Center — Comprehensive care in Naccache",
    description:
      "Specialist medicine, dentistry, nutrition, esthetics and rehabilitation together in Naccache, Lebanon — so your whole family's care lives in one place.",
    ogTitle: "Hajj Medical Center — Comprehensive, human-centered care",
    ogDescription:
      "Specialist medicine, dentistry, nutrition, esthetics and rehabilitation under one roof in Naccache, Lebanon.",
  },
  /** The clinic's name in running text (the logo itself is never translated). */
  clinic: "Hajj Medical Center",
  nav: {
    main: "Main",
    home: "Hajj Medical Center home",
    services: "Services",
    clinics: "Clinics",
    team: "Team",
    visit: "Visit us",
    book: "Book a visit",
    call: "Call {phone}",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
  },
  hero: {
    // The no-break space keeps the dash with the word before it rather than opening a line.
    headline: "Comprehensive, human-centered care\u00a0– under one roof",
    lede: "Specialist medicine, dentistry, nutrition, esthetics and rehabilitation together in Naccache, so your whole family's care lives in one place.",
    location: "Naccache, Lebanon. Walk-ins welcome.",
    departments: "Departments",
    /** Between the service names of a department: "A, B and 10 more". */
    listSeparator: ", ",
    andMore: plural({ other: "{items} and {n} more" }),
    serviceCount: plural({ one: "{n} service", other: "{n} services" }),
  },
  categories,
  booking: {
    title: "Book a visit",
    service: "Service",
    date: "Date",
    servicePlaceholder: "Choose a service",
    showServices: "Show services",
    noMatch: "No services match “{query}”.",
    datePlaceholder: "Pick a date",
    today: "Today · {date}",
    tomorrow: "Tomorrow · {date}",
    continue: "Continue",
    note: "Great — {service} on {date}. Add your name and phone below and our team will confirm.",
  },
  sections: {
    clinics: "Dedicated clinics",
    steps: "How a visit works",
    stepsList: [
      { title: "Book", text: "Choose the team and time that suits you." },
      { title: "Visit", text: "Meet your clinician in our modern, welcoming center." },
      { title: "Follow up", text: "Leave with a clear, coordinated next step." },
    ],
    team: "Meet the team",
    teamLede: "Full team bios coming soon.",
    why: "Why patients choose us",
    reasons: [
      "Specialists, dentists and dietitians under one roof",
      "Straightforward, unhurried appointments",
      "In-house panoramic X-ray",
      "Care coordinated across every team",
    ],
    visit: "Visit us",
    learnMore: "Learn more",
    treatmentAreas: "Treatment areas",
    addressPlaceholder: "[Address]",
    hoursPlaceholder: "[Hours]",
  },
  form: {
    name: "Name",
    namePlaceholder: "Your full name",
    phone: "Phone",
    phonePlaceholder: "Your phone number",
    sendWhatsApp: "Send on WhatsApp",
    send: "Send request",
    sending: "Sending…",
    whatsappSent: "Almost done, {name}! Tap Send in WhatsApp to deliver your request, and we'll reply to confirm.",
    whatsappReopen: "WhatsApp didn't open? Open it here",
    sent: "Thanks, {name}! We've received your request and will call you to confirm.",
    errors: {
      phoneInvalid: "Please enter a valid phone number.",
      nameMissing: "Please enter your full name.",
      bookingMissing: "Please choose a service and a preferred date in the booking card first.",
      generic: "Something went wrong. Please call us on {phone}.",
      network: "We couldn't send your request. Please check your connection or call us on {phone}.",
      /** By the API's error code (the API itself always answers in English). */
      invalid_payload: "Please check the highlighted fields.",
      rate_limited: "Too many requests from this device. Please call us instead.",
      whatsapp_only: "Appointment requests are taken on WhatsApp.",
    },
    /** The WhatsApp message the visitor sends to the clinic, line by line; *…* is bold in WhatsApp. */
    whatsappMessage: {
      greeting: "Hello Hajj Medical Center, I'd like to request an appointment.",
      name: "*Name:* {value}",
      phone: "*Phone:* {value}",
      service: "*Service:* {value}",
      date: "*Preferred date:* {value}",
    },
  },
  reviews: {
    title: "What patients say",
    rated: "Rated {rating} out of 5",
    /** {maps} is the "Google Maps" attribution, which is never translated. */
    count: plural({ one: "{n} review on {maps}", other: "{n} reviews on {maps}" }),
    previous: "Previous reviews",
    next: "Next reviews",
    region: "Patient reviews from Google",
    readAll: "Read all reviews",
    write: "Write a review",
    showLess: "Show less",
    readMore: "Read more",
    translated: "Translated by Google",
    showTranslation: "Show translation",
    showOriginal: "Show original",
    viewOnMaps: "View on Google Maps",
  },
  map: {
    pin: "{clinic}: show details",
    directions: "Get directions ↗",
    region: "Map of {place}",
  },
  footer: {
    tagline: "Comprehensive, human-centered care in Naccache.",
    rights: "© {year} Hajj Medical Center. All rights reserved.",
    credit: "Developed by {studio}",
  },
  error: {
    title: "We'll be right back",
    body: "Our website is having a moment. To book or ask a question, call Hajj Medical Center on {phone}.",
    retry: "Try again",
    call: "Call {phone}",
  },
};

export type Messages = typeof en;
