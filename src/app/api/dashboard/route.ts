import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { habitRepository } from "@/lib/repositories/habit.repository";
import { workoutRepository } from "@/lib/repositories/workout.repository";
import { expenseRepository } from "@/lib/repositories/expense.repository";
import { foodRepository } from "@/lib/repositories/food.repository";
import { learningRepository } from "@/lib/repositories/learning.repository";
import { bodyCareRepository } from "@/lib/repositories/body-care.repository";
import { ApiResponse } from "@/types";

function getMondayStr(now: Date): string {
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().split("T")[0];
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const view = request.nextUrl.searchParams.get("view") ?? "daily";
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const mondayStr = getMondayStr(now);

    // ── Core habit data (used in both views) ──
    const habits = await habitRepository.findByUserId(user.id);
    const activeHabitIds = new Set(habits.map((h) => h._id.toString()));

    const todayLogs = await habitRepository.getLogsForDateRange(user.id, today, today);
    const completedToday = todayLogs.filter(
      (l) => l.completed && activeHabitIds.has(l.habitId.toString())
    ).length;

    // Streak — single bulk query for past 365 days
    const streakStart = new Date();
    streakStart.setDate(streakStart.getDate() - 364);
    const streakStartStr = streakStart.toISOString().split("T")[0];
    const streakLogs = await habitRepository.getLogsForDateRange(user.id, streakStartStr, today);

    const completedDates = new Set(
      streakLogs
        .filter((l) => l.completed && activeHabitIds.has(l.habitId.toString()))
        .map((l) => l.date)
    );

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (completedDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const completionPercent = habits.length > 0
      ? Math.round((completedToday / habits.length) * 100)
      : 0;

    const habitSummaries = habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      color: h.color,
      completedToday: todayLogs.some(
        (l) => l.completed && l.habitId.toString() === h._id.toString()
      ),
    }));

    // ── Heatmap (both views) ──
    const heatmapDays = 84;
    const heatmapStart = new Date();
    heatmapStart.setDate(heatmapStart.getDate() - heatmapDays + 1);
    const heatmapStartStr = heatmapStart.toISOString().split("T")[0];

    const heatmapLogs = await habitRepository.getLogsForDateRange(
      user.id, heatmapStartStr, today
    );

    const heatmap: { date: string; count: number }[] = [];
    for (let i = 0; i < heatmapDays; i++) {
      const d = new Date(heatmapStart);
      d.setDate(heatmapStart.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const count = heatmapLogs.filter(
        (l) => l.date === dateStr && l.completed && activeHabitIds.has(l.habitId.toString())
      ).length;
      heatmap.push({ date: dateStr, count });
    }

    // ── Gym this week (both views) ──
    const workouts = await workoutRepository.findWorkoutsByUserId(user.id, 100);
    const thisWeekWorkouts = workouts.filter((w) => w.date >= mondayStr && w.date <= today);

    // ── Extra module data ──
    const [todayExpenses, todayFoodLogs, todayLearnings, todayBodyCareLogs] = await Promise.all([
      expenseRepository.getExpensesByDateRange(user.id, today, today),
      foodRepository.getFoodLogsByDateRange(user.id, today, today),
      learningRepository.getLearningsByDateRange(user.id, today, today),
      bodyCareRepository.getByDateRange(user.id, today, today),
    ]);

    const todayCalories = todayFoodLogs.reduce((sum, f) => sum + (f.calories ?? 0), 0);
    const todayProtein = todayFoodLogs.reduce((sum, f) => sum + (f.protein ?? 0), 0);
    const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const todayLearningMinutes = todayLearnings.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);
    const todayBodyCare = todayBodyCareLogs.length;

    // ── Base response (daily view) ──
    const data: Record<string, unknown> = {
      habitsToday: `${completedToday}/${habits.length}`,
      gymThisWeek: thisWeekWorkouts.length,
      activeStreak: streak,
      completionPercent,
      habitSummaries,
      heatmap,
      totalHabits: habits.length,
      todayCalories,
      todayProtein,
      todaySpent,
      todayLearningMinutes,
      todayBodyCare,
    };

    // ── Weekly additions ──
    if (view === "weekly") {
      // Build 7-day date list (Mon–Sun)
      const weekDates: string[] = [];
      const mondayDate = new Date(mondayStr + "T00:00:00");
      for (let i = 0; i < 7; i++) {
        const d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + i);
        weekDates.push(d.toISOString().split("T")[0]);
      }

      // Weekly habits
      const weekHabitLogs = await habitRepository.getLogsForDateRange(user.id, mondayStr, today);
      const weekCompleted = weekHabitLogs.filter(
        (l) => l.completed && activeHabitIds.has(l.habitId.toString())
      ).length;

      // Weekly module data
      const [weekExpenses, weekFoodLogs, weekLearnings, weekBodyCareLogs] = await Promise.all([
        expenseRepository.getExpensesByDateRange(user.id, mondayStr, today),
        foodRepository.getFoodLogsByDateRange(user.id, mondayStr, today),
        learningRepository.getLearningsByDateRange(user.id, mondayStr, today),
        bodyCareRepository.getByDateRange(user.id, mondayStr, today),
      ]);

      // Build daily breakdowns
      const weeklyCalories = weekDates.map((date) => ({
        day: getDayLabel(date),
        value: weekFoodLogs
          .filter((f) => f.date === date)
          .reduce((sum, f) => sum + (f.calories ?? 0), 0),
      }));

      const weeklySpending = weekDates.map((date) => ({
        day: getDayLabel(date),
        value: weekExpenses
          .filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.amount, 0),
      }));

      const weeklyLearning = weekDates.map((date) => ({
        day: getDayLabel(date),
        value: weekLearnings
          .filter((l) => l.date === date)
          .reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0),
      }));

      const weeklySpendingTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const weeklyCaloriesTotal = weekFoodLogs.reduce((sum, f) => sum + (f.calories ?? 0), 0);
      const daysElapsed = weekDates.filter((d) => d <= today).length;
      const weeklyCaloriesAvg = daysElapsed > 0 ? Math.round(weeklyCaloriesTotal / daysElapsed) : 0;
      const weeklyLearningTotal = weekLearnings.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

      Object.assign(data, {
        weeklyHabits: {
          completed: weekCompleted,
          total: habits.length * 7,
        },
        weeklyGym: thisWeekWorkouts.length,
        weeklyCalories,
        weeklySpending,
        weeklyLearning,
        weeklyBodyCare: weekBodyCareLogs.length,
        weeklySpendingTotal,
        weeklyCaloriesAvg,
        weeklyLearningTotal,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
