import { workoutRepository } from "@/lib/repositories/workout.repository";
import { createWorkoutSchema, addExerciseSchema, addSetSchema } from "@/lib/validators/workout.validator";
import { IWorkout, IGymSession, CreateWorkoutDTO, IExercise } from "@/types";

export class WorkoutService {
  // ==================== Workouts ====================

  async getWorkouts(userId: string): Promise<IWorkout[]> {
    return workoutRepository.findWorkoutsByUserId(userId);
  }

  async createWorkout(userId: string, data: CreateWorkoutDTO): Promise<IWorkout> {
    const parsed = createWorkoutSchema.parse(data);
    return workoutRepository.createWorkout(userId, parsed);
  }

  async deleteWorkout(id: string, userId: string): Promise<boolean> {
    return workoutRepository.deleteWorkout(id, userId);
  }

  // ==================== Gym Sessions ====================

  async getActiveSession(userId: string): Promise<IGymSession | null> {
    return workoutRepository.findActiveSession(userId);
  }

  async startSession(userId: string): Promise<IGymSession> {
    return workoutRepository.createSession(userId);
  }

  async addExerciseToSession(sessionId: string, userId: string, data: { name: string; muscleGroup: string }): Promise<IGymSession | null> {
    const parsed = addExerciseSchema.parse(data);
    const exercise: IExercise = {
      name: parsed.name,
      muscleGroup: parsed.muscleGroup,
      sets: [],
    };
    return workoutRepository.addExerciseToSession(sessionId, userId, exercise);
  }

  async addSetToExercise(
    sessionId: string,
    userId: string,
    data: { exerciseIndex: number; weight: number; reps: number; restTime?: number; notes?: string }
  ): Promise<IGymSession | null> {
    const parsed = addSetSchema.parse(data);
    const session = await workoutRepository.findActiveSession(userId);
    if (!session || session._id.toString() !== sessionId) return null;

    const exercises = [...session.exercises];
    if (parsed.exerciseIndex >= exercises.length) return null;

    const exercise = exercises[parsed.exerciseIndex];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      weight: parsed.weight,
      reps: parsed.reps,
      restTime: parsed.restTime,
      notes: parsed.notes,
    });

    return workoutRepository.updateSessionExercises(sessionId, userId, exercises);
  }

  async removeSetFromExercise(
    sessionId: string,
    userId: string,
    data: { exerciseIndex: number; setIndex: number }
  ): Promise<IGymSession | null> {
    const session = await workoutRepository.findActiveSession(userId);
    if (!session || session._id.toString() !== sessionId) return null;

    const exercises = [...session.exercises];
    if (data.exerciseIndex >= exercises.length) return null;

    const exercise = exercises[data.exerciseIndex];
    exercise.sets.splice(data.setIndex, 1);
    // Re-number remaining sets
    exercise.sets.forEach((s, i) => { s.setNumber = i + 1; });

    return workoutRepository.updateSessionExercises(sessionId, userId, exercises);
  }

  async endSession(sessionId: string, userId: string): Promise<{ session: IGymSession | null; workout: IWorkout | null }> {
    const session = await workoutRepository.endSession(sessionId, userId);
    if (!session) return { session: null, workout: null };

    // Auto-save as a workout
    let workout: IWorkout | null = null;
    if (session.exercises.length > 0) {
      const duration = session.endedAt
        ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
        : undefined;

      workout = await workoutRepository.createWorkout(userId, {
        date: new Date(session.startedAt).toISOString().split("T")[0],
        name: `Gym Session`,
        exercises: session.exercises,
        duration,
      });
    }

    return { session, workout };
  }

  async getRecentSessions(userId: string): Promise<IGymSession[]> {
    return workoutRepository.getRecentSessions(userId);
  }
}

export const workoutService = new WorkoutService();
