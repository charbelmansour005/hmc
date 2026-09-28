import { Schema, model, models, type Model, type Types } from "mongoose";
//test
export interface AdminDoc {
  _id: Types.ObjectId;
  username: string;
  passwordHash: string;
  role: "admin";
  /** Bumped on logout / password reset; tokens carrying an older value are rejected. */
  tokenVersion: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 64,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], required: true, default: "admin" },
    tokenVersion: { type: Number, required: true, default: 0 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Admin: Model<AdminDoc> =
  (models.Admin as Model<AdminDoc> | undefined) ??
  model<AdminDoc>("Admin", AdminSchema);
