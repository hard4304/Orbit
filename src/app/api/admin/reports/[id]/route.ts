import { NextResponse } from "next/server";
import { reportService } from "@/lib/services/report.service";
import { requireAdmin } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { sendReportStatusNotification } from "@/lib/notifications";
import { ApiResponse } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const report = await reportService.updateStatus(id, body.status);

    if (!report) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    void sendReportStatusNotification(
      report.userId.toString(),
      report.title,
      report.status
    );

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin();
    const { id } = await params;
    const success = await reportService.adminDelete(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
