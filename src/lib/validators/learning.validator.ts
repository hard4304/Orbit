import { z } from "zod";

export const createLearningSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  category: z.enum(["dsa", "lld", "hld", "frontend", "backend", "devops", "general", "work"]),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  durationMinutes: z.number().positive().optional(),
});

// we cant restict the enum to these only as we can have new categories so we can remvoe this maybe?