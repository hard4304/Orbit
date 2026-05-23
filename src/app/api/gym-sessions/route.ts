import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services/workout.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const session = await workoutService.getActiveSession(user.id);
    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const session = await workoutService.startSession(user.id);
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
