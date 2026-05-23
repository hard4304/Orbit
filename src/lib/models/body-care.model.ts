import mongoose, { Schema, Model } from "mongoose";
import { IBodyCareLog } from "@/types";

const BodyCareLogSchema = new Schema<IBodyCareLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["skincare", "haircare", "bodycare", "other"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    notes: { type: String },
    products: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

BodyCareLogSchema.index({ userId: 1, date: 1 });
BodyCareLogSchema.index({ userId: 1, type: 1 });

export const BodyCareLog: Model<IBodyCareLog> =
  mongoose.models.BodyCareLog || mongoose.model<IBodyCareLog>("BodyCareLog", BodyCareLogSchema);
