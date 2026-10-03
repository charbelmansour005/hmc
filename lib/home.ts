import "server-only";
import { cache } from "react";
import { Clinic } from "@/models/Clinic";
import { Doctor } from "@/models/Doctor";
import { Service } from "@/models/Service";
import { SiteSettings, SETTINGS_SINGLETON } from "@/models/SiteSettings";
import { connectDB } from "./db";
import { toClinicDTO, toDoctorDTO, toServiceDTO, toSettingsDTO } from "./dto";
import { googlePlacesKey } from "./google-reviews";
import { buildHomeContent } from "./home-content";
import type { Locale } from "./i18n/config";
import { getMessages } from "./i18n/messages";
import { SETTINGS_DEFAULTS } from "./settings";
import type { HomeContent } from "./types";

/** Everything the public page renders in one language, read live from MongoDB on each request. */
export const getHomeContent = cache(async (locale: Locale): Promise<HomeContent> => {
  await connectDB();
  const [services, clinics, doctors, settings] = await Promise.all([
    Service.find().lean(),
    Clinic.find().lean(),
    Doctor.find().lean(),
    SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean(),
  ]);

  const siteSettings = settings ? toSettingsDTO(settings) : { ...SETTINGS_DEFAULTS, updatedAt: null };
  return buildHomeContent(
    {
      services: services.map(toServiceDTO),
      clinics: clinics.map(toClinicDTO),
      doctors: doctors.map(toDoctorDTO),
      settings: siteSettings,
      // Reviews load in the browser later; here we only decide whether to render the section.
      reviewsEnabled: Boolean(googlePlacesKey()) && siteSettings.googlePlaceIds.length > 0,
    },
    locale,
    getMessages(locale),
  );
});
