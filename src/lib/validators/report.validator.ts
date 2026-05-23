import { z } from "zod";

export const createReportSchema = z.object({
  type: z.enum(["bug", "feature"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  screenshotUrl: z.string().url().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["open", "in-progress", "done"]),
});

// the report should have something called as wontFix