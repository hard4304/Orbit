import { NextResponse } from "next/server";
import { reportService } from "@/lib/services/report.service";
import { requireAdmin } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin();
    const reports = await reportService.getAll();
    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    return handleApiError(error);
  }
}
