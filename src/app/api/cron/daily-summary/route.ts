import { NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/user.repository";
import { habitRepository } from "@/lib/repositories/habit.repository";
import { workoutRepository } from "@/lib/repositories/workout.repository";
import { sendDailySummary } from "@/lib/notifications";

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await userRepository.findTelegramLinkedUsers();
  const today = new Date().toISOString().split("T")[0];
  let notified = 0;

  for (const user of users) {
    const userId = user._id.toString();

    const [habits, logs, workouts] = await Promise.all([
      habitRepository.findByUserId(userId),
      habitRepository.getLogsForDateRange(userId, today, today),
      workoutRepository.findWorkoutsByUserId(userId, 100),
    ]);

    const habitsTotal = habits.length;
    const habitsCompleted = logs.filter((l) => l.completed).length;
    const workoutsLogged = workouts.filter((w) => w.date === today).length;

    const sent = await sendDailySummary(userId, {
      habitsCompleted,
      habitsTotal,
      workoutsLogged,
    });

    if (sent) notified++;
  }

  return NextResponse.json({ success: true, notified });
}
