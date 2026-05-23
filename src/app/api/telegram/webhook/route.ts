import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { userRepository } from "@/lib/repositories/user.repository";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request): Promise<NextResponse> {
  // Verify webhook secret
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }
  }

  try {
    const body = await request.json();
    const message = body.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text as string;

    // Handle /start command with userId
    if (text.startsWith("/start ")) {
      const userId = text.slice(7).trim();
      if (!userId) {
        await sendTelegramMessage(chatId, "❌ Invalid link. Please use the link from your Orbit settings.");
        return NextResponse.json({ ok: true });
      }

      await connectDB();
      const user = await userRepository.updateTelegramChatId(userId, chatId);

      if (user) {
        await sendTelegramMessage(
          chatId,
          `✅ Telegram linked to <b>${user.username}</b>!\n\nYou'll now receive notifications here.`
        );
      } else {
        await sendTelegramMessage(chatId, "❌ User not found. Please try again from your Orbit settings.");
      }
    } else if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "👋 Welcome to Orbit Bot!\n\nTo link your account, use the link from your Orbit settings page."
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
