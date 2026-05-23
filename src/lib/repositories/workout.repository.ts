import { connectDB } from "@/lib/db/mongoose";
import { Workout, GymSession } from "@/lib/models/workout.model";
import { IWorkout, IGymSession, CreateWorkoutDTO, IExercise } from "@/types";
import { Types } from "mongoose";

export class WorkoutRepository {
  // ==================== Workouts ====================

  async findWorkoutsByUserId(userId: string, limit = 20): Promise<IWorkout[]> {
    await connectDB();
    return Workout.find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .limit(limit)
      .lean<IWorkout[]>();
  }

  async findWorkoutById(id: string, userId: string): Promise<IWorkout | null> {
    await connectDB();
    return Workout.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).lean<IWorkout>();
  }

  async createWorkout(userId: string, data: CreateWorkoutDTO): Promise<IWorkout> {
    await connectDB();
    const workout = await Workout.create({
      ...data,
      userId: new Types.ObjectId(userId),
    });
    return workout.toObject() as IWorkout;
  }

  async deleteWorkout(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Workout.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return !!result;
  }

  // ==================== Gym Sessions ====================

  async findActiveSession(userId: string): Promise<IGymSession | null> {
    await connectDB();
    return GymSession.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).lean<IGymSession>();
  }

  async createSession(userId: string): Promise<IGymSession> {
    await connectDB();
    // End any existing active sessions
    await GymSession.updateMany(
      { userId: new Types.ObjectId(userId), isActive: true },
      { $set: { isActive: false, endedAt: new Date() } }
    );

    const session = await GymSession.create({
      userId: new Types.ObjectId(userId),
      startedAt: new Date(),
      exercises: [],
      isActive: true,
    });
    return session.toObject() as IGymSession;
  }

  async addExerciseToSession(sessionId: string, userId: string, exercise: IExercise): Promise<IGymSession | null> {
    await connectDB();
    return GymSession.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      { $push: { exercises: exercise } },
      { new: true }
    ).lean<IGymSession>();
  }

  async updateSessionExercises(sessionId: string, userId: string, exercises: IExercise[]): Promise<IGymSession | null> {
    await connectDB();
    return GymSession.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      { $set: { exercises } },
      { new: true }
    ).lean<IGymSession>();
  }

  async endSession(sessionId: string, userId: string): Promise<IGymSession | null> {
    await connectDB();
    return GymSession.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      { $set: { isActive: false, endedAt: new Date() } },
      { new: true }
    ).lean<IGymSession>();
  }

  async getRecentSessions(userId: string, limit = 10): Promise<IGymSession[]> {
    await connectDB();
    return GymSession.find({ userId: new Types.ObjectId(userId) })
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean<IGymSession[]>();
  }
}

export const workoutRepository = new WorkoutRepository();
