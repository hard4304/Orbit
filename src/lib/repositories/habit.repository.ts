import { connectDB } from "@/lib/db/mongoose";
import { Habit, HabitLog } from "@/lib/models/habit.model";
import { IHabit, IHabitLog, CreateHabitDTO, HabitLogDTO } from "@/types";
import { Types } from "mongoose";

export class HabitRepository {
  async findByUserId(userId: string): Promise<IHabit[]> {
    await connectDB();
    return Habit.find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 })
      .lean<IHabit[]>();
  }

  async findById(id: string, userId: string): Promise<IHabit | null> {
    await connectDB();
    return Habit.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).lean<IHabit>();
  }

  async create(userId: string, data: CreateHabitDTO): Promise<IHabit> {
    await connectDB();
    const habit = await Habit.create({
      ...data,
      userId: new Types.ObjectId(userId),
    });
    return habit.toObject() as IHabit;
  }

  async update(id: string, userId: string, data: Partial<CreateHabitDTO>): Promise<IHabit | null> {
    await connectDB();
    return Habit.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    ).lean<IHabit>();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Habit.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (result) {
      // Also delete all associated logs
      await HabitLog.deleteMany({ habitId: new Types.ObjectId(id) });
    }
    return !!result;
  }

  // ==================== Habit Logs ====================

  async getLogsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IHabitLog[]> {
    await connectDB();
    return HabitLog.find({
      userId: new Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }).lean<IHabitLog[]>();
  }

  async getLogsForHabit(habitId: string, userId: string, startDate: string, endDate: string): Promise<IHabitLog[]> {
    await connectDB();
    return HabitLog.find({
      habitId: new Types.ObjectId(habitId),
      userId: new Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }).lean<IHabitLog[]>();
  }

  async upsertLog(habitId: string, userId: string, data: HabitLogDTO): Promise<IHabitLog> {
    await connectDB();
    const log = await HabitLog.findOneAndUpdate(
      {
        habitId: new Types.ObjectId(habitId),
        userId: new Types.ObjectId(userId),
        date: data.date,
      },
      {
        $set: {
          completed: data.completed,
          note: data.note,
        },
        $setOnInsert: {
          habitId: new Types.ObjectId(habitId),
          userId: new Types.ObjectId(userId),
          date: data.date,
        },
      },
      { upsert: true, new: true }
    ).lean<IHabitLog>();
    return log!;
  }
}

export const habitRepository = new HabitRepository();
