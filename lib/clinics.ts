import "server-only";
import { Types, type Model } from "mongoose";
import { Clinic } from "@/models/Clinic";
import { Service } from "@/models/Service";
import { connectDB } from "./db";
import { toClinicDTO, toClinicTranslations } from "./dto";
import { bySortOrder } from "./home-content";
import { assertObjectId, badRequest, notFound } from "./http";
import type { ClinicCreateInput, ClinicUpdateInput } from "./schemas";
import { uniqueSlug } from "./slug";
import { deleteImage, plainImage, saveImage } from "./storage";
import { mergeTranslations } from "./translations";
import type { ClinicDTO } from "./types";
import type { UploadedImage } from "./upload";

export async function listClinics(): Promise<ClinicDTO[]> {
  await connectDB();
  const docs = await Clinic.find().lean();
  return docs.map(toClinicDTO).sort(bySortOrder);
}

export async function getClinic(id: string): Promise<ClinicDTO> {
  assertObjectId(id, "Clinic");
  await connectDB();
  const doc = await Clinic.findById(id).lean();
  if (!doc) throw notFound("Clinic");
  return toClinicDTO(doc);
}

/** The booking target must exist and be bookable itself (not a cross-link card). */
async function assertBookableService(serviceId: string): Promise<void> {
  const service = await Service.findById(serviceId).select({ bookAs: 1 }).lean();
  if (!service || service.bookAs) {
    throw badRequest("Please check the highlighted fields.", { serviceId: "Choose a bookable service." });
  }
}

export async function createClinic(input: ClinicCreateInput, image: UploadedImage | null): Promise<ClinicDTO> {
  if (!image) throw badRequest("Please check the highlighted fields.", { image: "An image is required." });
  await connectDB();
  await assertBookableService(input.serviceId);

  const slug = await uniqueSlug(Clinic as unknown as Model<{ slug: string }>, `clinic-${input.name}`);
  const stored = await saveImage(image.bytes, image.ext, input.imageAlt);
  try {
    const doc = await Clinic.create({
      slug,
      name: input.name,
      chip: input.chip,
      description: input.description,
      image: stored,
      service: new Types.ObjectId(input.serviceId),
      sortOrder: input.sortOrder,
      translations: mergeTranslations(toClinicTranslations(undefined), input.translations),
    });
    return toClinicDTO(doc.toObject());
  } catch (err) {
    await deleteImage(stored);
    throw err;
  }
}

export async function updateClinic(
  id: string,
  patch: ClinicUpdateInput,
  image: UploadedImage | null,
): Promise<ClinicDTO> {
  assertObjectId(id, "Clinic");
  await connectDB();
  const doc = await Clinic.findById(id);
  if (!doc) throw notFound("Clinic");
  if (patch.serviceId !== undefined) await assertBookableService(patch.serviceId);

  const previousImage = plainImage(doc.image);
  const alt = patch.imageAlt ?? doc.image.alt;
  const stored = image ? await saveImage(image.bytes, image.ext, alt) : null;

  if (patch.name !== undefined) doc.name = patch.name;
  if (patch.chip !== undefined) doc.chip = patch.chip;
  if (patch.description !== undefined) doc.description = patch.description;
  if (patch.sortOrder !== undefined) doc.sortOrder = patch.sortOrder;
  if (patch.serviceId !== undefined) doc.service = new Types.ObjectId(patch.serviceId);
  doc.image = stored ?? { ...plainImage(doc.image)!, alt };
  doc.translations = mergeTranslations(toClinicTranslations(doc.toObject().translations), patch.translations);

  try {
    await doc.save();
  } catch (err) {
    if (stored) await deleteImage(stored);
    throw err;
  }
  if (stored) await deleteImage(previousImage);
  return toClinicDTO(doc.toObject());
}

export async function deleteClinic(id: string): Promise<void> {
  assertObjectId(id, "Clinic");
  await connectDB();
  const doc = await Clinic.findByIdAndDelete(id).lean();
  if (!doc) throw notFound("Clinic");
  await deleteImage(doc.image);
}
