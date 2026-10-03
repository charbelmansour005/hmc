import "server-only";
import { Types, type Model } from "mongoose";
import { Clinic } from "@/models/Clinic";
import { Service, type ServiceDoc } from "@/models/Service";
import { CATEGORIES, CATEGORY_META } from "./categories";
import { connectDB } from "./db";
import { toServiceDTO, toServiceTranslations } from "./dto";
import { bySortOrder } from "./home-content";
import { assertObjectId, badRequest, conflict, notFound, type FieldErrors } from "./http";
import type { ServiceCreateInput, ServiceUpdateInput } from "./schemas";
import { uniqueSlug } from "./slug";
import { deleteImage, plainImage, saveImage } from "./storage";
import { mapTranslations, mergeTranslations } from "./translations";
import type { ServiceDTO, ServiceText, Translations } from "./types";
import type { UploadedImage } from "./upload";

const categoryIndex = (c: ServiceDTO["category"]) => CATEGORIES.indexOf(c);

export async function listServices(): Promise<ServiceDTO[]> {
  await connectDB();
  const docs = await Service.find().lean();
  return docs
    .map(toServiceDTO)
    .sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category) || bySortOrder(a, b));
}

export async function getService(id: string): Promise<ServiceDTO> {
  assertObjectId(id, "Service");
  await connectDB();
  const doc = await Service.findById(id).lean();
  if (!doc) throw notFound("Service");
  return toServiceDTO(doc);
}

/** Services a visitor can book (i.e. not cross-link cards), for select inputs. */
export async function listBookableServices(): Promise<{ id: string; label: string; group: string }[]> {
  const services = await listServices();
  return services
    .filter((s) => !s.bookAsId)
    .map((s) => ({ id: s.id, label: s.bookingLabel ?? s.name, group: CATEGORY_META[s.category].optgroup }));
}

type ServiceFields = {
  category: ServiceDoc["category"];
  display: ServiceDoc["display"];
  chip: string | null;
  tags: string[];
  bookAsId: string | null;
};

/** Business rules that span several fields; run after merging a patch with the stored document. */
async function validateService(merged: ServiceFields, selfId: string | null): Promise<void> {
  const fields: FieldErrors = {};
  if (merged.display === "card" && !merged.chip) fields.chip = "Cards need a chip label.";
  if (merged.display === "card" && merged.tags.length > 0) fields.tags = "Tags are only shown on feature cards.";
  if (Object.keys(fields).length > 0) throw badRequest("Please check the highlighted fields.", fields);

  if (merged.bookAsId) {
    if (merged.bookAsId === selfId) throw badRequest("A service cannot book itself.", { bookAsId: "Pick another service." });
    const target = await Service.findById(merged.bookAsId).select({ bookAs: 1 }).lean();
    if (!target) throw badRequest("Please check the highlighted fields.", { bookAsId: "That service does not exist." });
    if (target.bookAs) {
      throw badRequest("Please check the highlighted fields.", { bookAsId: "That service itself books another one." });
    }
    if (selfId) {
      const selfObjectId = new Types.ObjectId(selfId);
      const [linkedCards, clinics] = await Promise.all([
        Service.countDocuments({ bookAs: selfObjectId }),
        Clinic.countDocuments({ service: selfObjectId }),
      ]);
      if (linkedCards > 0 || clinics > 0) {
        throw conflict("Other cards or clinics book this service, so it cannot point elsewhere. Change them first.");
      }
    }
  }
}

/** Like the English tags, translated tags only exist on feature cards. */
const tagsFor = (display: ServiceDoc["display"], translations: Translations<ServiceText>) =>
  mapTranslations(translations, (copy) => ({ ...copy, tags: display === "feature" ? copy.tags : [] }));

export async function createService(input: ServiceCreateInput, image: UploadedImage | null): Promise<ServiceDTO> {
  if (!image) throw badRequest("Please check the highlighted fields.", { image: "An image is required." });
  await connectDB();
  await validateService(input, null);

  const slug = await uniqueSlug(Service as unknown as Model<{ slug: string }>, `${input.category}-${input.name}`);
  const stored = await saveImage(image.bytes, image.ext, input.imageAlt);
  try {
    const doc = await Service.create({
      slug,
      category: input.category,
      display: input.display,
      name: input.name,
      bookingLabel: input.bookingLabel,
      chip: input.chip,
      description: input.description,
      tags: input.display === "feature" ? input.tags : [],
      image: stored,
      bookAs: input.bookAsId ? new Types.ObjectId(input.bookAsId) : null,
      sortOrder: input.sortOrder,
      translations: tagsFor(input.display, mergeTranslations(toServiceTranslations(undefined), input.translations)),
    });
    return toServiceDTO(doc.toObject());
  } catch (err) {
    await deleteImage(stored);
    throw err;
  }
}

export async function updateService(
  id: string,
  patch: ServiceUpdateInput,
  image: UploadedImage | null,
): Promise<ServiceDTO> {
  assertObjectId(id, "Service");
  await connectDB();
  const doc = await Service.findById(id);
  if (!doc) throw notFound("Service");

  const merged = {
    category: patch.category ?? doc.category,
    display: patch.display ?? doc.display,
    chip: patch.chip !== undefined ? patch.chip : doc.chip,
    tags: patch.tags ?? [...doc.tags],
    bookAsId: patch.bookAsId !== undefined ? patch.bookAsId : doc.bookAs ? String(doc.bookAs) : null,
  };
  await validateService(merged, id);

  const previousImage = plainImage(doc.image);
  const alt = patch.imageAlt ?? doc.image.alt;
  const stored = image ? await saveImage(image.bytes, image.ext, alt) : null;

  if (patch.name !== undefined) doc.name = patch.name;
  if (patch.bookingLabel !== undefined) doc.bookingLabel = patch.bookingLabel;
  if (patch.description !== undefined) doc.description = patch.description;
  if (patch.sortOrder !== undefined) doc.sortOrder = patch.sortOrder;
  doc.category = merged.category;
  doc.display = merged.display;
  doc.chip = merged.chip;
  doc.tags = merged.display === "feature" ? merged.tags : [];
  doc.bookAs = merged.bookAsId ? new Types.ObjectId(merged.bookAsId) : null;
  doc.image = stored ?? { ...plainImage(doc.image)!, alt };
  doc.translations = tagsFor(
    merged.display,
    mergeTranslations(toServiceTranslations(doc.toObject().translations), patch.translations),
  );

  try {
    await doc.save();
  } catch (err) {
    if (stored) await deleteImage(stored);
    throw err;
  }
  if (stored) await deleteImage(previousImage);
  return toServiceDTO(doc.toObject());
}

export async function deleteService(id: string): Promise<void> {
  assertObjectId(id, "Service");
  await connectDB();
  const doc = await Service.findById(id).lean();
  if (!doc) throw notFound("Service");

  const [linkedCards, clinics] = await Promise.all([
    Service.countDocuments({ bookAs: doc._id }),
    Clinic.countDocuments({ service: doc._id }),
  ]);
  if (linkedCards > 0 || clinics > 0) {
    throw conflict(
      `This service is booked by ${linkedCards} other card(s) and ${clinics} clinic(s). Point them elsewhere before deleting it.`,
    );
  }

  await Service.deleteOne({ _id: doc._id });
  await deleteImage(doc.image);
}
