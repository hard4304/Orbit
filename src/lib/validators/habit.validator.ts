import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const habitLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  completed: z.boolean(),
  note: z.string().max(500).optional(),
});
