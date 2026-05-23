import mongoose, { Schema, Model } from "mongoose";
import { IHabit, IHabitLog } from "@/types";

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    customDays: [{ type: Number, min: 0, max: 6 }],
    reminderTime: { type: String },
    color: { type: String, default: "#6366f1" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, isActive: 1 });

const HabitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: false },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });

export const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export const HabitLog: Model<IHabitLog> =
  mongoose.models.HabitLog || mongoose.model<IHabitLog>("HabitLog", HabitLogSchema);
