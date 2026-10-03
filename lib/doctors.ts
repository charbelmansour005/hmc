import "server-only";
import type { Model } from "mongoose";
import { Doctor } from "@/models/Doctor";
import { connectDB } from "./db";
import { toDoctorDTO, toDoctorTranslations } from "./dto";
import { bySortOrder } from "./home-content";
import { assertObjectId, notFound } from "./http";
import type { DoctorCreateInput, DoctorUpdateInput } from "./schemas";
import { uniqueSlug } from "./slug";
import { deleteImage, plainImage, saveImage } from "./storage";
import { mergeTranslations } from "./translations";
import type { DoctorDTO } from "./types";
import type { UploadedImage } from "./upload";

export async function listDoctors(): Promise<DoctorDTO[]> {
  await connectDB();
  const docs = await Doctor.find().lean();
  return docs.map(toDoctorDTO).sort(bySortOrder);
}

export async function getDoctor(id: string): Promise<DoctorDTO> {
  assertObjectId(id, "Team member");
  await connectDB();
  const doc = await Doctor.findById(id).lean();
  if (!doc) throw notFound("Team member");
  return toDoctorDTO(doc);
}

export async function createDoctor(input: DoctorCreateInput, photo: UploadedImage | null): Promise<DoctorDTO> {
  await connectDB();
  const slug = await uniqueSlug(Doctor as unknown as Model<{ slug: string }>, `team-${input.name}`);
  const stored = photo ? await saveImage(photo.bytes, photo.ext, input.photoAlt ?? `Photo of ${input.name}`) : null;
  try {
    const doc = await Doctor.create({
      slug,
      name: input.name,
      specialty: input.specialty,
      bio: input.bio,
      accent: input.accent,
      photo: stored,
      sortOrder: input.sortOrder,
      translations: mergeTranslations(toDoctorTranslations(undefined), input.translations),
    });
    return toDoctorDTO(doc.toObject());
  } catch (err) {
    if (stored) await deleteImage(stored);
    throw err;
  }
}

export async function updateDoctor(
  id: string,
  patch: DoctorUpdateInput,
  photo: UploadedImage | null,
): Promise<DoctorDTO> {
  assertObjectId(id, "Team member");
  await connectDB();
  const doc = await Doctor.findById(id);
  if (!doc) throw notFound("Team member");

  const previousPhoto = plainImage(doc.photo);
  const name = patch.name ?? doc.name;
  const alt = patch.photoAlt ?? doc.photo?.alt ?? `Photo of ${name}`;
  const stored = photo ? await saveImage(photo.bytes, photo.ext, alt) : null;

  if (patch.name !== undefined) doc.name = patch.name;
  if (patch.specialty !== undefined) doc.specialty = patch.specialty;
  if (patch.bio !== undefined) doc.bio = patch.bio;
  if (patch.accent !== undefined) doc.accent = patch.accent;
  if (patch.sortOrder !== undefined) doc.sortOrder = patch.sortOrder;
  doc.translations = mergeTranslations(toDoctorTranslations(doc.toObject().translations), patch.translations);
  if (stored) doc.photo = stored;
  else if (patch.removePhoto) doc.photo = null;
  else if (doc.photo) doc.photo = { ...plainImage(doc.photo)!, alt };

  try {
    await doc.save();
  } catch (err) {
    if (stored) await deleteImage(stored);
    throw err;
  }
  if (stored || patch.removePhoto) await deleteImage(previousPhoto);
  return toDoctorDTO(doc.toObject());
}

export async function deleteDoctor(id: string): Promise<void> {
  assertObjectId(id, "Team member");
  await connectDB();
  const doc = await Doctor.findByIdAndDelete(id).lean();
  if (!doc) throw notFound("Team member");
  await deleteImage(doc.photo);
}
