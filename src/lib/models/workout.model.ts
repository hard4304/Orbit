import mongoose, { Schema, Model } from "mongoose";
import { IWorkout, IGymSession, IExerciseSet, IExercise } from "@/types";

const ExerciseSetSchema = new Schema<IExerciseSet>(
  {
    setNumber: { type: Number, required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    restTime: { type: Number },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    muscleGroup: {
      type: String,
      enum: ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core", "cardio", "full_body"],
      required: true,
    },
    sets: [ExerciseSetSchema],
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    exercises: [ExerciseSchema],
    duration: { type: Number },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, date: -1 });

const GymSessionSchema = new Schema<IGymSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    exercises: [ExerciseSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GymSessionSchema.index({ userId: 1, isActive: 1 });

export const Workout: Model<IWorkout> =
  mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);

export const GymSession: Model<IGymSession> =
  mongoose.models.GymSession || mongoose.model<IGymSession>("GymSession", GymSessionSchema);
