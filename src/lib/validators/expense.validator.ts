import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.enum(["food", "transport", "rent", "entertainment", "shopping", "health", "utilities", "other"]),
  medium: z.enum(["upi", "card", "cash"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  description: z.string().min(1).max(200),
});
