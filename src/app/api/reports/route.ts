import { NextResponse } from "next/server";
import { reportService } from "@/lib/services/report.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const reports = await reportService.getByUser(user.id);
    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const report = await reportService.create(user.id, body);
    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
