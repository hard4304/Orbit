import { habitRepository } from "@/lib/repositories/habit.repository";
import { createHabitSchema, habitLogSchema } from "@/lib/validators/habit.validator";
import { IHabit, IHabitLog, CreateHabitDTO, HabitLogDTO } from "@/types";

export class HabitService {
  async getHabits(userId: string): Promise<IHabit[]> {
    return habitRepository.findByUserId(userId);
  }

  async getHabit(id: string, userId: string): Promise<IHabit | null> {
    return habitRepository.findById(id, userId);
  }

  async createHabit(userId: string, data: CreateHabitDTO): Promise<IHabit> {
    const parsed = createHabitSchema.parse(data);
    return habitRepository.create(userId, parsed);
  }

  async updateHabit(id: string, userId: string, data: Partial<CreateHabitDTO>): Promise<IHabit | null> {
    return habitRepository.update(id, userId, data);
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    return habitRepository.delete(id, userId);
  }

  async toggleHabitLog(habitId: string, userId: string, data: HabitLogDTO): Promise<IHabitLog> {
    const parsed = habitLogSchema.parse(data);
    return habitRepository.upsertLog(habitId, userId, parsed);
  }

  async getLogsForDateRange(userId: string, startDate: string, endDate: string): Promise<IHabitLog[]> {
    return habitRepository.getLogsForDateRange(userId, startDate, endDate);
  }

  async getHabitStreak(habitId: string, userId: string): Promise<number> {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const logs = await habitRepository.getLogsForHabit(habitId, userId, dateStr, dateStr);
      const completed = logs.some((log) => log.completed);

      if (completed) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}

export const habitService = new HabitService();
