import mongoose, { Schema, Model } from "mongoose";
import { IFoodLog } from "@/types";

const FoodLogSchema = new Schema<IFoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    servingSize: { type: Number, required: true, default: 100 },
    calories: { type: Number, required: true },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  { timestamps: true }
);

FoodLogSchema.index({ userId: 1, date: 1 });

export const FoodLog: Model<IFoodLog> =
  mongoose.models.FoodLog || mongoose.model<IFoodLog>("FoodLog", FoodLogSchema);
