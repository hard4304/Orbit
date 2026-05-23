import mongoose, { Schema, Model } from "mongoose";
import { IReport } from "@/types";

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["bug", "feature"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    screenshotUrl: { type: String },
    status: {
      type: String,
      enum: ["open", "in-progress", "done"],
      default: "open",
    },
  },
  { timestamps: true }
);

ReportSchema.index({ userId: 1, status: 1 });

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
