import { Schema, model, models, type Model, type Types } from "mongoose";
import { CATEGORIES, SERVICE_DISPLAYS, type Category, type ServiceDisplay } from "../lib/categories";
import type { ServiceText } from "../lib/types";
import { ImageSchema, type ImageRef } from "./_image";
import { translated, translationsField, type StoredTranslations } from "./_translations";

export interface ServiceDoc {
  _id: Types.ObjectId;
  slug: string;
  category: Category;
  display: ServiceDisplay;
  name: string;
  bookingLabel: string | null;
  chip: string | null;
  description: string | null;
  tags: string[];
  image: ImageRef;
  bookAs: Types.ObjectId | null;
  sortOrder: number;
  /** French and Arabic copies of the text above. Missing on documents written before it existed. */
  translations?: StoredTranslations<ServiceText>;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<ServiceDoc>(
  {
    slug: { type: String, required: true, unique: true, immutable: true, trim: true, maxlength: 120 },
    category: { type: String, enum: CATEGORIES, required: true },
    display: { type: String, enum: SERVICE_DISPLAYS, required: true, default: "card" },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    bookingLabel: { type: String, default: null, trim: true, maxlength: 60 },
    chip: { type: String, default: null, trim: true, maxlength: 24 },
    description: { type: String, default: null, trim: true, maxlength: 200 },
    tags: {
      type: [{ type: String, trim: true, maxlength: 20 }],
      default: [],
      validate: { validator: (v: string[]) => v.length <= 6, message: "At most 6 tags" },
    },
    image: { type: ImageSchema, required: true },
    bookAs: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    sortOrder: { type: Number, required: true, default: 0, min: 0, max: 9999 },
    translations: translationsField({
      name: translated(80),
      bookingLabel: translated(60),
      chip: translated(24),
      description: translated(200),
      tags: {
        type: [{ type: String, trim: true, maxlength: 20 }],
        default: [],
        validate: { validator: (v: string[]) => v.length <= 6, message: "At most 6 tags" },
      },
      imageAlt: translated(140),
    }),
  },
  { timestamps: true },
);

ServiceSchema.index({ category: 1, sortOrder: 1 });
ServiceSchema.index({ bookAs: 1 });

export const Service: Model<ServiceDoc> =
  (models.Service as Model<ServiceDoc> | undefined) ?? model<ServiceDoc>("Service", ServiceSchema);
