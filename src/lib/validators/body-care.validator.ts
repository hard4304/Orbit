import { z } from "zod";

export const createBodyCareLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  type: z.enum(["skincare", "haircare", "bodycare", "other"]),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  products: z.array(z.string().min(1).max(100)).max(20).optional(),
});
