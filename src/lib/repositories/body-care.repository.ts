import { BodyCareLog } from "@/lib/models/body-care.model";
import { IBodyCareLog, CreateBodyCareLogDTO } from "@/types";

class BodyCareRepository {
  async create(userId: string, data: CreateBodyCareLogDTO): Promise<IBodyCareLog> {
    return BodyCareLog.create({ userId, ...data });
  }

  async getByDate(userId: string, date: string): Promise<IBodyCareLog[]> {
    return BodyCareLog.find({ userId, date }).sort({ createdAt: -1 });
  }

  async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IBodyCareLog[]> {
    return BodyCareLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
  }

  async getByType(userId: string, type: string): Promise<IBodyCareLog[]> {
    return BodyCareLog.find({ userId, type }).sort({ date: -1, createdAt: -1 });
  }

  async update(userId: string, id: string, data: Partial<CreateBodyCareLogDTO>): Promise<IBodyCareLog | null> {
    return BodyCareLog.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await BodyCareLog.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }
}

export const bodyCareRepository = new BodyCareRepository();
