import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services/workout.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const deleted = await workoutService.deleteWorkout(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Workout not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
