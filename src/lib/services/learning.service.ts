import { learningRepository } from "@/lib/repositories/learning.repository";
import { createLearningSchema } from "@/lib/validators/learning.validator";
import { ILearning, CreateLearningDTO } from "@/types";

class LearningService {
  async createLearning(userId: string, data: CreateLearningDTO): Promise<ILearning> {
    const parsed = createLearningSchema.parse(data);
    return learningRepository.createLearning(userId, parsed);
  }

  async getLearningsByDate(userId: string, date: string): Promise<ILearning[]> {
    return learningRepository.getLearningsByDate(userId, date);
  }

  async getLearningsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ILearning[]> {
    return learningRepository.getLearningsByDateRange(userId, startDate, endDate);
  }

  async getLearningsByCategory(userId: string, category: string): Promise<ILearning[]> {
    return learningRepository.getLearningsByCategory(userId, category);
  }

  async updateLearning(
    userId: string,
    learningId: string,
    data: Partial<CreateLearningDTO>
  ): Promise<ILearning | null> {
    return learningRepository.updateLearning(userId, learningId, data);
  }

  async deleteLearning(userId: string, learningId: string): Promise<boolean> {
    return learningRepository.deleteLearning(userId, learningId);
  }
}

export const learningService = new LearningService();
