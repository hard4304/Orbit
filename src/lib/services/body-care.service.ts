import { bodyCareRepository } from "@/lib/repositories/body-care.repository";
import { createBodyCareLogSchema } from "@/lib/validators/body-care.validator";
import { IBodyCareLog, CreateBodyCareLogDTO } from "@/types";

class BodyCareService {
  async create(userId: string, data: CreateBodyCareLogDTO): Promise<IBodyCareLog> {
    const parsed = createBodyCareLogSchema.parse(data);
    return bodyCareRepository.create(userId, parsed);
  }

  async getByDate(userId: string, date: string): Promise<IBodyCareLog[]> {
    return bodyCareRepository.getByDate(userId, date);
  }

  async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IBodyCareLog[]> {
    return bodyCareRepository.getByDateRange(userId, startDate, endDate);
  }

  async getByType(userId: string, type: string): Promise<IBodyCareLog[]> {
    return bodyCareRepository.getByType(userId, type);
  }

  async update(userId: string, id: string, data: Partial<CreateBodyCareLogDTO>): Promise<IBodyCareLog | null> {
    return bodyCareRepository.update(userId, id, data);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return bodyCareRepository.delete(userId, id);
  }
}

export const bodyCareService = new BodyCareService();
