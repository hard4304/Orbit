import mongoose, { Schema, Model } from "mongoose";
import { ILearning } from "@/types";

const LearningSchema = new Schema<ILearning>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["dsa", "lld", "hld", "frontend", "backend", "devops", "general", "work"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    durationMinutes: { type: Number },
  },
  { timestamps: true }
);

LearningSchema.index({ userId: 1, date: 1 });
LearningSchema.index({ userId: 1, category: 1 });

export const Learning: Model<ILearning> =
  mongoose.models.Learning || mongoose.model<ILearning>("Learning", LearningSchema);
