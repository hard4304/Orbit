import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { userRepository } from "@/lib/repositories/user.repository";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const dbUser = await userRepository.findById(user.id);

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser._id,
        username: dbUser.username,
        email: dbUser.email,
        telegramLinked: dbUser.telegramLinked || false,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (body.unlinkTelegram) {
      const updated = await userRepository.unlinkTelegram(user.id);
      if (!updated) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: {
          id: updated._id,
          username: updated.username,
          email: updated.email,
          telegramLinked: false,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "No valid update provided" },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
