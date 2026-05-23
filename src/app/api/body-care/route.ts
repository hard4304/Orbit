import { NextResponse } from "next/server";
import { bodyCareService } from "@/lib/services/body-care.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");

    if (type) {
      const logs = await bodyCareService.getByType(user.id, type);
      return NextResponse.json({ success: true, data: logs });
    } else if (date) {
      const logs = await bodyCareService.getByDate(user.id, date);
      return NextResponse.json({ success: true, data: logs });
    } else if (startDate && endDate) {
      const logs = await bodyCareService.getByDateRange(user.id, startDate, endDate);
      return NextResponse.json({ success: true, data: logs });
    } else {
      return NextResponse.json(
        { success: false, error: "date, (startDate and endDate), or type is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const log = await bodyCareService.create(user.id, body);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
