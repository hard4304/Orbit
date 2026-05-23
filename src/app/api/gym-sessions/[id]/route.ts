import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services/workout.service";
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
    const { action } = body;

    let result;

    switch (action) {
      case "add-exercise":
        result = await workoutService.addExerciseToSession(id, user.id, body.data);
        break;
      case "add-set":
        result = await workoutService.addSetToExercise(id, user.id, body.data);
        break;
      case "remove-set":
        result = await workoutService.removeSetFromExercise(id, user.id, body.data);
        break;
      case "end":
        result = await workoutService.endSession(id, user.id);
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
