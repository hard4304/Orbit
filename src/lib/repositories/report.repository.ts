import { Report } from "@/lib/models/report.model";
import { IReport, CreateReportDTO, ReportStatus } from "@/types";

class ReportRepository {
  async create(userId: string, data: CreateReportDTO): Promise<IReport> {
    return Report.create({ userId, ...data });
  }

  async getByUser(userId: string): Promise<IReport[]> {
    return Report.find({ userId }).sort({ createdAt: -1 });
  }

  async getAll(): Promise<IReport[]> {
    return Report.find().sort({ createdAt: -1 }).populate("userId", "username email");
  }

  async updateStatus(id: string, status: ReportStatus): Promise<IReport | null> {
    return Report.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await Report.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async adminDelete(id: string): Promise<boolean> {
    const result = await Report.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export const reportRepository = new ReportRepository();
