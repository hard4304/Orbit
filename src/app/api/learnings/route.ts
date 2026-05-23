import { NextResponse } from "next/server";
import { learningService } from "@/lib/services/learning.service";
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
    const category = searchParams.get("category");

    if (category) {
      const learnings = await learningService.getLearningsByCategory(user.id, category);
      return NextResponse.json({ success: true, data: learnings });
    } else if (date) {
      const learnings = await learningService.getLearningsByDate(user.id, date);
      return NextResponse.json({ success: true, data: learnings });
    } else if (startDate && endDate) {
      const learnings = await learningService.getLearningsByDateRange(user.id, startDate, endDate);
      return NextResponse.json({ success: true, data: learnings });
    } else {
      return NextResponse.json(
        { success: false, error: "date, (startDate and endDate), or category is required" },
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
    const learning = await learningService.createLearning(user.id, body);
    return NextResponse.json({ success: true, data: learning }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
