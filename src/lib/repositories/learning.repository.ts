import { Learning } from "@/lib/models/learning.model";
import { ILearning, CreateLearningDTO } from "@/types";

class LearningRepository {
  async createLearning(userId: string, data: CreateLearningDTO): Promise<ILearning> {
    return Learning.create({ userId, ...data });
  }

  async getLearningsByDate(userId: string, date: string): Promise<ILearning[]> {
    return Learning.find({ userId, date }).sort({ createdAt: -1 });
  }

  async getLearningsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ILearning[]> {
    return Learning.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
  }

  async getLearningsByCategory(userId: string, category: string): Promise<ILearning[]> {
    return Learning.find({ userId, category }).sort({ date: -1, createdAt: -1 });
  }

  async updateLearning(
    userId: string,
    learningId: string,
    data: Partial<CreateLearningDTO>
  ): Promise<ILearning | null> {
    return Learning.findOneAndUpdate(
      { _id: learningId, userId },
      { $set: data },
      { new: true }
    );
  }

  async deleteLearning(userId: string, learningId: string): Promise<boolean> {
    const result = await Learning.deleteOne({ _id: learningId, userId });
    return result.deletedCount > 0;
  }
}

export const learningRepository = new LearningRepository();
