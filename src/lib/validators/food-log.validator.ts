import { z } from "zod";

export const createFoodLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodName: z.string().min(1).max(100),
  quantity: z.number().positive().default(1),
  servingSize: z.number().positive().default(100),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
});

// we can make the calorie as optional and serving size and qunatity can be merged to single quantity as the serving size is always 100g 