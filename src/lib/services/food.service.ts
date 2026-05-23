import { foodRepository } from "@/lib/repositories/food.repository";
import { createFoodLogSchema } from "@/lib/validators/food-log.validator";
import { CreateFoodLogDTO, IFoodLog } from "@/types";

export class FoodService {
  async createFoodLog(userId: string, data: CreateFoodLogDTO): Promise<IFoodLog> {
    const parsed = createFoodLogSchema.parse(data);
    return foodRepository.createFoodLog(userId, parsed);
  }

  async getFoodLogsByDate(userId: string, date: string): Promise<IFoodLog[]> {
    return foodRepository.getFoodLogsByDate(userId, date);
  }

  async getFoodLogsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IFoodLog[]> {
    return foodRepository.getFoodLogsByDateRange(userId, startDate, endDate);
  }

  async updateFoodLog(userId: string, logId: string, data: Partial<CreateFoodLogDTO>): Promise<IFoodLog | null> {
    return foodRepository.updateFoodLog(userId, logId, data);
  }

  async deleteFoodLog(userId: string, logId: string): Promise<boolean> {
    return foodRepository.deleteFoodLog(userId, logId);
  }
}

export const foodService = new FoodService();
