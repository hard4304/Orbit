import { reportRepository } from "@/lib/repositories/report.repository";
import { createReportSchema, updateReportStatusSchema } from "@/lib/validators/report.validator";
import { IReport, CreateReportDTO, ReportStatus } from "@/types";

class ReportService {
  async create(userId: string, data: CreateReportDTO): Promise<IReport> {
    const parsed = createReportSchema.parse(data);
    return reportRepository.create(userId, parsed);
  }

  async getByUser(userId: string): Promise<IReport[]> {
    return reportRepository.getByUser(userId);
  }

  async getAll(): Promise<IReport[]> {
    return reportRepository.getAll();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<IReport | null> {
    const parsed = updateReportStatusSchema.parse({ status });
    return reportRepository.updateStatus(id, parsed.status);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return reportRepository.delete(userId, id);
  }

  async adminDelete(id: string): Promise<boolean> {
    return reportRepository.adminDelete(id);
  }
}

export const reportService = new ReportService();
