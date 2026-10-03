// Idempotent seed. Usage:
//   npm run seed                          content (first run only) + admin account
//   npm run seed -- --admin-only          admin account only
//   npm run seed -- --content             re-apply seed content even if already seeded
//                                         (still never overwrites existing items)
//   npm run seed -- --reset-admin-password  set the admin password from env, log out sessions
//   npm run seed -- --translations        add the seed's French and Arabic to a database
//                                         seeded before the site was translated (nothing else);
//                                         with --dry-run it only reports what it would add
//
// Everything is upserted on a natural key (slug / singleton / username) with
// $setOnInsert, so re-running never overwrites content edited in the CMS.
// A seed-version marker stops a re-run from resurrecting items deleted in the CMS.
// NB: this file must not import anything that imports "server-only".
import "./load-env";
import bcrypt from "bcryptjs";
import mongoose, { type Model } from "mongoose";
import { Admin } from "../models/Admin";
import { AppointmentRequest } from "../models/AppointmentRequest";
import { Clinic } from "../models/Clinic";
import { Doctor } from "../models/Doctor";
import { Meta } from "../models/Meta";
import { RateLimit } from "../models/RateLimit";
import { Service } from "../models/Service";
import { SETTINGS_SINGLETON, SiteSettings } from "../models/SiteSettings";
import type { StoredTranslations } from "../models/_translations";
import { TRANSLATION_LOCALES, type TranslationLocale } from "../lib/i18n/config";
import { settingsSchema } from "../lib/schemas";
import { SEED_VERSION, seedClinics, seedDoctors, seedServices, seedSettings } from "./seed-data";
import { clinicTranslations, doctorTranslations, serviceTranslations } from "./seed-translations";

const args = new Set(process.argv.slice(2));
const ADMIN_ONLY = args.has("--admin-only");
const FORCE_CONTENT = args.has("--content");
const RESET_PASSWORD = args.has("--reset-admin-password");
const TRANSLATIONS_ONLY = args.has("--translations");
const DRY_RUN = args.has("--dry-run");

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

type Counts = { inserted: number; existing: number };
const summary: Record<string, Counts> = {};

async function upsertAll<T extends { slug: string }>(
  label: string,
  model: Model<never>,
  docs: T[],
): Promise<void> {
  // Validate every seed document with the Mongoose schema first; bulkWrite does not.
  for (const doc of docs) {
    const err = new (model as unknown as Model<T>)(doc).validateSync();
    if (err) fail(`${label} "${doc.slug}" is invalid: ${err.message}`);
  }
  const res = await (model as unknown as Model<T>).bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { slug: doc.slug },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    })) as never,
  );
  summary[label] = { inserted: res.upsertedCount, existing: docs.length - res.upsertedCount };
}

async function seedContent() {
  const external = (img: { url: string; alt: string }) => ({ ...img, key: null, storage: "external" as const });

  // Pass 1: bookable services. Pass 2: cross-link cards, which need their target's _id.
  const bookable = seedServices.filter((s) => !s.bookAs);
  const links = seedServices.filter((s) => s.bookAs);
  const toDoc = (s: (typeof seedServices)[number], bookAs: mongoose.Types.ObjectId | null) => ({
    slug: s.slug,
    category: s.category,
    display: s.display,
    name: s.name,
    bookingLabel: s.bookingLabel,
    chip: s.chip,
    description: s.description,
    tags: s.tags,
    image: external(s.image),
    bookAs,
    sortOrder: s.sortOrder,
    translations: serviceTranslations[s.slug] ?? {},
  });

  await upsertAll("services", Service as never, bookable.map((s) => toDoc(s, null)));

  const idBySlug = new Map(
    (await Service.find({}, { slug: 1 }).lean()).map((d) => [d.slug, d._id as mongoose.Types.ObjectId]),
  );
  const resolve = (slug: string) => idBySlug.get(slug) ?? fail(`Seed references unknown service "${slug}"`);

  await upsertAll("service links", Service as never, links.map((s) => toDoc(s, resolve(s.bookAs!))));

  await upsertAll(
    "clinics",
    Clinic as never,
    seedClinics.map((c) => ({
      slug: c.slug,
      name: c.name,
      chip: c.chip,
      description: c.description,
      image: external(c.image),
      service: resolve(c.service),
      sortOrder: c.sortOrder,
      translations: clinicTranslations[c.slug] ?? {},
    })),
  );

  await upsertAll(
    "team",
    Doctor as never,
    seedDoctors.map((d) => ({ ...d, photo: null, translations: doctorTranslations[d.slug] ?? {} })),
  );

  // Singleton: $setOnInsert only, so existing CMS values are never overwritten.
  const settingsCheck = settingsSchema.safeParse(seedSettings);
  if (!settingsCheck.success) fail(`settings are invalid: ${settingsCheck.error.message}`);
  const settingsError = new SiteSettings({ singleton: SETTINGS_SINGLETON, ...seedSettings }).validateSync();
  if (settingsError) fail(`settings are invalid: ${settingsError.message}`);
  const settings = await SiteSettings.updateOne(
    { singleton: SETTINGS_SINGLETON },
    { $setOnInsert: { singleton: SETTINGS_SINGLETON, ...seedSettings } },
    { upsert: true },
  );
  summary.settings = { inserted: settings.upsertedCount, existing: 1 - settings.upsertedCount };
}

// ------------------------------------------------------------ translations
type Fields = Record<string, unknown>;
type Copies = Partial<Record<TranslationLocale, Fields>>;
type Report = { filled: number; kept: number; absent: number; edited: string[] };
const translationReports: Record<string, Report> = {};

/** A value that is actually there: not null, not "", not an empty list. */
const present = (v: unknown) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== "");
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * The translations to add to one stored item. A field is filled only when it
 * has no translation yet and its English text is still the seed's own, so a
 * translation never ends up beside English it was not written for, and nothing
 * entered in the CMS is ever overwritten.
 */
function missingTranslations(
  item: string,
  english: Fields,
  seedEnglish: Fields,
  stored: StoredTranslations<Fields> | undefined,
  copies: Copies | undefined,
  report: Report,
): Fields {
  const set: Fields = {};
  for (const locale of TRANSLATION_LOCALES) {
    for (const [field, value] of Object.entries(copies?.[locale] ?? {})) {
      if (!present(value)) continue;
      if (present(stored?.[locale]?.[field])) {
        report.kept++;
      } else if (!same(english[field], seedEnglish[field])) {
        report.edited.push(`${item}: ${field} (${locale})`);
      } else {
        set[`translations.${locale}.${field}`] = value;
        report.filled++;
      }
    }
  }
  return set;
}

/** Fails before anything is written if a seed translation breaks a limit or names an unknown slug. */
function checkSeedTranslations() {
  // Only `translations` is under test: the other required fields get stand-ins.
  const image = { url: "https://example.com/x.jpg", alt: "placeholder", key: null, storage: "external" as const };
  const checks: [string, { slug: string }[], Record<string, unknown>, (slug: string) => Error | null][] = [
    [
      "service",
      seedServices,
      serviceTranslations,
      (slug) =>
        new Service({ slug, category: "dental", name: "Check", image, translations: serviceTranslations[slug] }).validateSync(),
    ],
    [
      "clinic",
      seedClinics,
      clinicTranslations,
      (slug) =>
        new Clinic({
          slug,
          name: "Check",
          chip: "x",
          description: "Check",
          image,
          service: new mongoose.Types.ObjectId(),
          translations: clinicTranslations[slug],
        }).validateSync(),
    ],
    [
      "team member",
      seedDoctors,
      doctorTranslations,
      (slug) => new Doctor({ slug, name: "Check", specialty: "Check", translations: doctorTranslations[slug] }).validateSync(),
    ],
  ];
  for (const [label, items, translations, validate] of checks) {
    const slugs = new Set(items.map((item) => item.slug));
    for (const slug of Object.keys(translations)) {
      if (!slugs.has(slug)) fail(`seed-translations.ts translates an unknown ${label}: "${slug}"`);
      const err = validate(slug);
      if (err) fail(`The translation of ${label} "${slug}" is invalid: ${err.message}`);
    }
  }
}

/** --translations: adds the seed's French and Arabic to items that are still as seeded. */
async function backfillTranslations() {
  const report = (label: string): Report => (translationReports[label] = { filled: 0, kept: 0, absent: 0, edited: [] });
  const save = async (model: Model<never>, id: unknown, set: Fields) => {
    if (DRY_RUN || Object.keys(set).length === 0) return;
    await (model as unknown as Model<Fields>).updateOne({ _id: id }, { $set: set }, { runValidators: true });
  };

  const services = report("services");
  for (const seed of seedServices) {
    const doc = await Service.findOne({ slug: seed.slug }).lean();
    if (!doc) {
      services.absent++;
      continue;
    }
    const english = (s: Pick<typeof seed, "name" | "bookingLabel" | "chip" | "description" | "tags">, imageAlt: string) => ({
      name: s.name,
      bookingLabel: s.bookingLabel,
      chip: s.chip,
      description: s.description,
      tags: s.tags,
      imageAlt,
    });
    const set = missingTranslations(
      seed.slug,
      english(doc, doc.image.alt),
      english(seed, seed.image.alt),
      doc.translations,
      serviceTranslations[seed.slug],
      services,
    );
    await save(Service as never, doc._id, set);
  }

  const clinics = report("clinics");
  for (const seed of seedClinics) {
    const doc = await Clinic.findOne({ slug: seed.slug }).lean();
    if (!doc) {
      clinics.absent++;
      continue;
    }
    const english = (c: Pick<typeof seed, "name" | "chip" | "description">, imageAlt: string) => ({
      name: c.name,
      chip: c.chip,
      description: c.description,
      imageAlt,
    });
    const set = missingTranslations(
      seed.slug,
      english(doc, doc.image.alt),
      english(seed, seed.image.alt),
      doc.translations,
      clinicTranslations[seed.slug],
      clinics,
    );
    await save(Clinic as never, doc._id, set);
  }

  const team = report("team");
  for (const seed of seedDoctors) {
    const doc = await Doctor.findOne({ slug: seed.slug }).lean();
    if (!doc) {
      team.absent++;
      continue;
    }
    const english = (d: Pick<typeof seed, "name" | "specialty" | "bio">) => ({
      name: d.name,
      specialty: d.specialty,
      bio: d.bio,
    });
    const set = missingTranslations(seed.slug, english(doc), english(seed), doc.translations, doctorTranslations[seed.slug], team);
    await save(Doctor as never, doc._id, set);
  }

  const settings = report("settings");
  const doc = await SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean();
  if (!doc) {
    // No settings saved yet: the site shows the built-in defaults, which are already translated.
    settings.absent++;
  } else {
    const english = (s: { address: string | null; openingHours: string | null }) => ({
      address: s.address,
      openingHours: s.openingHours,
    });
    const set = missingTranslations(
      "settings",
      english(doc),
      english(seedSettings),
      doc.translations,
      seedSettings.translations,
      settings,
    );
    await save(SiteSettings as never, doc._id, set);
  }
}

function printTranslationReport() {
  console.log(`\nTranslations (${DRY_RUN ? "would add" : "added"} / already translated / items not in the database):`);
  for (const [label, r] of Object.entries(translationReports)) {
    console.log(`  ${label.padEnd(10)} ${String(r.filled).padStart(4)} / ${String(r.kept).padStart(4)} / ${r.absent}`);
  }
  const edited = Object.values(translationReports).flatMap((r) => r.edited);
  if (edited.length > 0) {
    console.log("\nLeft alone, because the English was edited in the CMS (translate these there):");
    for (const line of edited) console.log(`  - ${line}`);
  }
}

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!username) fail("ADMIN_USERNAME is not set (in .env.local).");
  if (!password || password.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");

  const others = await Admin.countDocuments({ username: { $ne: username } });
  if (others > 0) fail("Another admin account already exists. This CMS supports exactly one admin.");

  const passwordHash = await bcrypt.hash(password, 12);
  if (RESET_PASSWORD) {
    const res = await Admin.updateOne(
      { username },
      { $set: { passwordHash }, $inc: { tokenVersion: 1 }, $setOnInsert: { role: "admin" } },
      { upsert: true },
    );
    summary.admin = { inserted: res.upsertedCount, existing: 1 - res.upsertedCount };
    console.log("  admin password reset; existing sessions logged out");
  } else {
    const res = await Admin.updateOne(
      { username },
      { $setOnInsert: { username, passwordHash, role: "admin", tokenVersion: 0 } },
      { upsert: true },
    );
    summary.admin = { inserted: res.upsertedCount, existing: 1 - res.upsertedCount };
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) fail("MONGODB_URI is not set (in .env.local).");
  checkSeedTranslations();

  await mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10_000 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // Build indexes (unique slugs, singleton, username, TTLs) before writing.
  for (const model of [Service, Clinic, Doctor, SiteSettings, AppointmentRequest, Admin, RateLimit, Meta]) {
    await (model as Model<unknown>).init();
  }

  if (DRY_RUN && !TRANSLATIONS_ONLY) fail("--dry-run only works together with --translations.");
  if (TRANSLATIONS_ONLY) {
    await backfillTranslations();
    printTranslationReport();
    return;
  }

  if (!ADMIN_ONLY) {
    const marker = await Meta.findOne({ key: "seed" }).lean();
    if (marker && marker.seedVersion >= SEED_VERSION && !FORCE_CONTENT) {
      console.log(`  content already seeded (v${marker.seedVersion}); skipping. Use --content to re-apply.`);
    } else {
      await seedContent();
      await Meta.updateOne(
        { key: "seed" },
        { $set: { seedVersion: SEED_VERSION, seededAt: new Date() } },
        { upsert: true },
      );
    }
  }
  await seedAdmin();

  console.log("\nSeed summary (inserted / already present):");
  for (const [label, c] of Object.entries(summary)) {
    console.log(`  ${label.padEnd(14)} ${String(c.inserted).padStart(3)} / ${c.existing}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
