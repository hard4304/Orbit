import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const user = await authService.register(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
