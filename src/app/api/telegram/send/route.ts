import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { userRepository } from "@/lib/repositories/user.repository";
import { sendTelegramMessage } from "@/lib/telegram";
import { ApiResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "message is required" },
        { status: 400 }
      );
    }

    const dbUser = await userRepository.findById(user.id);
    if (!dbUser?.telegramChatId || !dbUser.telegramLinked) {
      return NextResponse.json(
        { success: false, error: "Telegram not linked" },
        { status: 400 }
      );
    }

    const sent = await sendTelegramMessage(dbUser.telegramChatId, message);
    if (!sent) {
      return NextResponse.json(
        { success: false, error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { sent: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
