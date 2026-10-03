import { Schema, model, models, type Model, type Types } from "mongoose";
import type { ClinicText } from "../lib/types";
import { ImageSchema, type ImageRef } from "./_image";
import { translated, translationsField, type StoredTranslations } from "./_translations";

export interface ClinicDoc {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  chip: string;
  description: string;
  image: ImageRef;
  /** The bookable service this clinic's card preselects */
  service: Types.ObjectId;
  sortOrder: number;
  /** French and Arabic copies of the text above. Missing on documents written before it existed. */
  translations?: StoredTranslations<ClinicText>;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<ClinicDoc>(
  {
    slug: { type: String, required: true, unique: true, immutable: true, trim: true, maxlength: 120 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    chip: { type: String, required: true, trim: true, maxlength: 24 },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: ImageSchema, required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    sortOrder: { type: Number, required: true, default: 0, min: 0, max: 9999 },
    translations: translationsField({
      name: translated(80),
      chip: translated(24),
      description: translated(200),
      imageAlt: translated(140),
    }),
  },
  { timestamps: true },
);

ClinicSchema.index({ sortOrder: 1 });
ClinicSchema.index({ service: 1 });

export const Clinic: Model<ClinicDoc> =
  (models.Clinic as Model<ClinicDoc> | undefined) ?? model<ClinicDoc>("Clinic", ClinicSchema);
