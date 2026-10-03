import { Schema, model, models, type Model, type Types } from "mongoose";
import { ACCENTS, type Accent } from "../lib/categories";
import type { DoctorText } from "../lib/types";
import { ImageSchema, type ImageRef } from "./_image";
import { translated, translationsField, type StoredTranslations } from "./_translations";

export interface DoctorDoc {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  photo: ImageRef | null;
  /** Orb colour and role-text colour on the public page */
  accent: Accent;
  sortOrder: number;
  /** French and Arabic copies of the text above. Missing on documents written before it existed. */
  translations?: StoredTranslations<DoctorText>;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<DoctorDoc>(
  {
    slug: { type: String, required: true, unique: true, immutable: true, trim: true, maxlength: 120 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    specialty: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    bio: { type: String, default: "", trim: true, maxlength: 160 },
    photo: { type: ImageSchema, default: null },
    accent: { type: String, enum: ACCENTS, required: true, default: "teal" },
    sortOrder: { type: Number, required: true, default: 0, min: 0, max: 9999 },
    translations: translationsField({
      name: translated(80),
      specialty: translated(60),
      bio: translated(160),
      photoAlt: translated(140),
    }),
  },
  { timestamps: true },
);

DoctorSchema.index({ sortOrder: 1 });

export const Doctor: Model<DoctorDoc> =
  (models.Doctor as Model<DoctorDoc> | undefined) ?? model<DoctorDoc>("Doctor", DoctorSchema);
