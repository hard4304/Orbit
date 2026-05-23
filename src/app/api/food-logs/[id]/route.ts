import { NextResponse } from "next/server";
import { foodService } from "@/lib/services/food.service";
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
    const log = await foodService.updateFoodLog(user.id, id, body);

    if (!log) {
      return NextResponse.json({ success: false, error: "Food log not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const success = await foodService.deleteFoodLog(user.id, id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: "Food log not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
