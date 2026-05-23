import { z } from "zod";

const muscleGroupEnum = z.enum([
  "chest", "back", "shoulders", "biceps", "triceps",
  "legs", "core", "cardio", "full_body",
]);

const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  weight: z.number().min(0),
  reps: z.number().int().positive(),
  restTime: z.number().int().min(0).optional(),
  notes: z.string().max(200).optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: muscleGroupEnum,
  sets: z.array(exerciseSetSchema),
});

export const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(1).max(100),
  exercises: z.array(exerciseSchema).min(1),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export const addExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: muscleGroupEnum,
});

export const addSetSchema = z.object({
  exerciseIndex: z.number().int().min(0),
  weight: z.number().min(0),
  reps: z.number().int().positive(),
  restTime: z.number().int().min(0).optional(),
  notes: z.string().max(200).optional(),
});
