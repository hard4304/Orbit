import { sendTelegramMessage } from "@/lib/telegram";
import { userRepository } from "@/lib/repositories/user.repository";

export async function sendHabitReminder(userId: string, habitName: string): Promise<boolean> {
  const user = await userRepository.findById(userId);
  if (!user?.telegramChatId || !user.telegramLinked) return false;

  const text = `🔔 <b>Habit Reminder</b>\n\nDon't forget to complete: <b>${habitName}</b>`;
  return sendTelegramMessage(user.telegramChatId, text);
}

export async function sendHabitCompletionNotification(
  userId: string,
  habitName: string
): Promise<boolean> {
  const user = await userRepository.findById(userId);
  if (!user?.telegramChatId || !user.telegramLinked) return false;

  const text = `✅ <b>Habit Completed</b>\n\nYou completed <b>${habitName}</b>! Keep it up 💪`;
  return sendTelegramMessage(user.telegramChatId, text);
}

export async function sendReportStatusNotification(
  userId: string,
  reportTitle: string,
  newStatus: string
): Promise<boolean> {
  const user = await userRepository.findById(userId);
  if (!user?.telegramChatId || !user.telegramLinked) return false;

  const statusLabels: Record<string, string> = {
    open: "Open",
    "in-progress": "In Progress",
    done: "Done",
  };
  const label = statusLabels[newStatus] || newStatus;

  const text = `📋 <b>Report Updated</b>\n\nYour report "<b>${reportTitle}</b>" is now <b>${label}</b>`;
  return sendTelegramMessage(user.telegramChatId, text);
}

export async function sendDailySummary(
  userId: string,
  summary: { habitsCompleted: number; habitsTotal: number; workoutsLogged: number }
): Promise<boolean> {
  const user = await userRepository.findById(userId);
  if (!user?.telegramChatId || !user.telegramLinked) return false;

  const text =
    `📊 <b>Daily Summary</b>\n\n` +
    `✅ Habits: ${summary.habitsCompleted}/${summary.habitsTotal}\n` +
    `💪 Workouts: ${summary.workoutsLogged}`;

  return sendTelegramMessage(user.telegramChatId, text);
}
