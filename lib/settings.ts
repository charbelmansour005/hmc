import "server-only";
import { SETTINGS_SINGLETON, SiteSettings, type SiteSettingsDoc } from "@/models/SiteSettings";
import { isCategory } from "./categories";
import { connectDB } from "./db";
import { toSettingsDTO, toSettingsTranslations } from "./dto";
import { parseWith } from "./http";
import { settingsSchema, type SettingsInput, type SettingsUpdateInput } from "./schemas";
import { mergeTranslations } from "./translations";
import type { SettingsDTO, SettingsText, Translations } from "./types";

/** The whole settings document, with a copy of the translated text for every language. */
type Settings = Omit<SettingsInput, "translations"> & { translations: Translations<SettingsText> };

// Keep in step with seedSettings in scripts/seed-data.ts.
export const SETTINGS_DEFAULTS: Settings = {
  phone: "+961 4 520 065",
  email: null,
  address: "Ground floor, Naccache, Green Zone A, bldg, 71, Naqqache",
  openingHours: "Mon–Fri, 8:30 AM – 6:00 PM · Sat & Sun closed",
  mapQuery: "33.9285959, 35.5966253",
  bookingChannel: "whatsapp",
  whatsapp: null,
  googlePlaceIds: ["ChIJF7o0ARI_HxURCkCkKINPVC8"],
  hiddenSections: [],
  translations: {
    fr: {
      address: "Rez-de-chaussée, immeuble 71, Green Zone A, Naccache",
      openingHours: "Lun–Ven, 8h30 – 18h00 · Sam et dim fermé",
    },
    ar: {
      address: "الطابق الأرضي، مبنى 71، Green Zone A، النقاش",
      openingHours: "الإثنين–الجمعة، 8:30 ص – 6:00 م · السبت والأحد مغلق",
    },
  },
};

function pickSettings(doc: SiteSettingsDoc): Settings {
  return {
    phone: doc.phone,
    email: doc.email ?? null,
    address: doc.address ?? null,
    openingHours: doc.openingHours ?? null,
    mapQuery: doc.mapQuery,
    bookingChannel: doc.bookingChannel ?? SETTINGS_DEFAULTS.bookingChannel,
    whatsapp: doc.whatsapp ?? null,
    googlePlaceIds: [...(doc.googlePlaceIds ?? [])],
    hiddenSections: (doc.hiddenSections ?? []).filter(isCategory),
    translations: toSettingsTranslations(doc.translations),
  };
}

export async function getSettings(): Promise<SettingsDTO> {
  await connectDB();
  const doc = await SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean();
  return doc ? toSettingsDTO(doc) : { ...SETTINGS_DEFAULTS, updatedAt: null };
}

/**
 * Rule 8: with upsert, Mongoose validates the update as if inserting, so a
 * $set carrying only some required fields fails. Read the current values,
 * merge the patch, validate the whole thing, and write the whole document.
 * The constant `singleton` key (unique index) means only one row can exist.
 */
export async function updateSettings(patch: SettingsUpdateInput): Promise<SettingsDTO> {
  await connectDB();
  const current = await SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean();
  const stored = current ? pickSettings(current) : SETTINGS_DEFAULTS;
  const merged = parseWith(settingsSchema, {
    ...stored,
    ...patch,
    // A language left out of the patch keeps its stored translation.
    translations: mergeTranslations(stored.translations, patch.translations),
  });

  const write = () =>
    SiteSettings.findOneAndUpdate(
      { singleton: SETTINGS_SINGLETON },
      { $set: merged },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();

  let doc;
  try {
    doc = await write();
  } catch (err) {
    // Two first-ever writes racing on the unique singleton key: retry as an update.
    if ((err as { code?: number }).code !== 11000) throw err;
    doc = await write();
  }
  if (!doc) throw new Error("Settings write returned no document");
  return toSettingsDTO(doc);
}
