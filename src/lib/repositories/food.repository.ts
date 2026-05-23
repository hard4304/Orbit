import { FoodLog } from "../models/food-log.model";
import { CreateFoodLogDTO, IFoodLog } from "@/types";

export class FoodRepository {
  async createFoodLog(userId: string, data: CreateFoodLogDTO): Promise<IFoodLog> {
    return FoodLog.create({
      userId,
      ...data,
    });
  }

  async getFoodLogsByDate(userId: string, date: string): Promise<IFoodLog[]> {
    return FoodLog.find({ userId, date }).sort({ createdAt: -1 });
  }

  async getFoodLogsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IFoodLog[]> {
    return FoodLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, createdAt: 1 });
  }

  async updateFoodLog(userId: string, logId: string, data: Partial<CreateFoodLogDTO>): Promise<IFoodLog | null> {
    return FoodLog.findOneAndUpdate(
      { _id: logId, userId },
      { $set: data },
      { new: true }
    );
  }

  async deleteFoodLog(userId: string, logId: string): Promise<boolean> {
    const result = await FoodLog.deleteOne({ _id: logId, userId });
    return result.deletedCount > 0;
  }
}

export const foodRepository = new FoodRepository();
