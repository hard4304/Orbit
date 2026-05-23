import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services/workout.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const workouts = await workoutService.getWorkouts(user.id);
    return NextResponse.json({ success: true, data: workouts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const workout = await workoutService.createWorkout(user.id, body);
    return NextResponse.json({ success: true, data: workout }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
