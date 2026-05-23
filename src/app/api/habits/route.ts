import { NextResponse } from "next/server";
import { habitService } from "@/lib/services/habit.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    if (searchParams.get("logs") === "true") {
      const start = searchParams.get("start");
      const end = searchParams.get("end");
      if (!start || !end) {
        return NextResponse.json(
          { success: false, error: "start and end are required" },
          { status: 400 }
        );
      }
      const logs = await habitService.getLogsForDateRange(user.id, start, end);
      return NextResponse.json({ success: true, data: logs });
    }

    const habits = await habitService.getHabits(user.id);
    return NextResponse.json({ success: true, data: habits });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const habit = await habitService.createHabit(user.id, body);
    return NextResponse.json({ success: true, data: habit }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
