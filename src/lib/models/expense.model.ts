import mongoose, { Schema, Model } from "mongoose";
import { IExpense } from "@/types";

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ["food", "transport", "rent", "entertainment", "shopping", "health", "utilities", "other"],
      required: true,
    },
    medium: {
      type: String,
      enum: ["upi", "card", "cash"],
      required: true,
    },
    date: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, date: 1 });
ExpenseSchema.index({ userId: 1, category: 1 });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
