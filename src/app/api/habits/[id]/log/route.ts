import { NextResponse } from "next/server";
import { habitService } from "@/lib/services/habit.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { sendHabitCompletionNotification } from "@/lib/notifications";
import { ApiResponse } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const log = await habitService.toggleHabitLog(id, user.id, body);

    if (log.completed) {
      const habit = await habitService.getHabit(id, user.id);
      if (habit) {
        void sendHabitCompletionNotification(user.id, habit.name);
      }
    }

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return handleApiError(error);
  }
}
