import { NextResponse } from "next/server";
import { habitService } from "@/lib/services/habit.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const habit = await habitService.updateHabit(id, user.id, body);
    if (!habit) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: habit });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const deleted = await habitService.deleteHabit(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
