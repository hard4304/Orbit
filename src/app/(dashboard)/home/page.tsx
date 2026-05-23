"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { ConsistencyHeatmap } from "@/components/dashboard/consistency-heatmap";
import { BarChart } from "@/components/dashboard/bar-chart";
import {
  Flame, Dumbbell, CheckCircle, Utensils, Wallet, BookOpen, Sparkles,
} from "lucide-react";

interface HabitSummary {
  id: string;
  name: string;
  color: string;
  completedToday: boolean;
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface DayValue {
  day: string;
  value: number;
}

interface DashboardStats {
  habitsToday: string;
  gymThisWeek: number;
  activeStreak: number;
  completionPercent: number;
  habitSummaries: HabitSummary[];
  heatmap: HeatmapDay[];
  totalHabits: number;
  // Daily extras
  todayCalories: number;
  todayProtein: number;
  todaySpent: number;
  todayLearningMinutes: number;
  todayBodyCare: number;
  // Weekly extras
  weeklyHabits?: { completed: number; total: number };
  weeklyGym?: number;
  weeklyCalories?: DayValue[];
  weeklySpending?: DayValue[];
  weeklyLearning?: DayValue[];
  weeklyBodyCare?: number;
  weeklySpendingTotal?: number;
  weeklyCaloriesAvg?: number;
  weeklyLearningTotal?: number;
}

const PASTEL_BG = [
  "bg-habit-pink/40",
  "bg-habit-green/40",
  "bg-habit-purple/40",
  "bg-habit-peach/40",
  "bg-habit-blue/40",
  "bg-habit-yellow/40",
];

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).toUpperCase();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = useCallback(async (v: string) => {
    try {
      const res = await fetch(`/api/dashboard?view=${v}`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchStats(view);
  }, [view, fetchStats]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {formatDate()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide uppercase">
            Daily Habit Overview
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3 font-heading">
            {getGreeting()},{" "}
            <br className="hidden sm:block" />
            {firstName}!
          </h1>
        </div>
      </div>

      {/* Daily / Weekly toggle */}
      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "daily" | "weekly")}
      >
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        {/* ── Daily View ── */}
        <TabsContent value="daily">
          <div className="space-y-8 mt-2">
            {/* Original 3 stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-habit-peach/20 border-none ring-0">
                <CardContent className="flex items-center gap-5 py-6">
                  <div className="relative">
                    <ProgressRing percent={stats?.completionPercent ?? 0} size={90} strokeWidth={8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/70">Daily Progress</p>
                    <p className="text-3xl font-bold mt-1">{stats?.habitsToday ?? "--"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">habits done</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-habit-pink/20 border-none ring-0">
                <CardContent className="flex items-center gap-5 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-habit-pink/40">
                    <Flame className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/70">Streaks</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <div>
                        <p className="text-xs text-muted-foreground">Active</p>
                        <p className="text-3xl font-bold">{stats?.activeStreak ?? "--"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-habit-blue/20 border-none ring-0">
                <CardContent className="flex items-center gap-5 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-habit-blue/40">
                    <Dumbbell className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/70">Gym This Week</p>
                    <p className="text-3xl font-bold mt-1">{stats?.gymThisWeek ?? "--"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">sessions</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New module stat cards */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Card className="bg-habit-green/20 border-none ring-0">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-habit-green/40">
                    <Utensils className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Calories</p>
                    <p className="text-xl font-bold">{stats?.todayCalories ?? 0}</p>
                    {(stats?.todayProtein ?? 0) > 0 && (
                      <p className="text-[10px] text-muted-foreground">{stats!.todayProtein}g protein</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-habit-purple/20 border-none ring-0">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-habit-purple/40">
                    <Wallet className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Spent</p>
                    <p className="text-xl font-bold">₹{stats?.todaySpent ?? 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-habit-yellow/20 border-none ring-0">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-habit-yellow/40">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Learning</p>
                    <p className="text-xl font-bold">{stats?.todayLearningMinutes ?? 0}<span className="text-sm font-normal">min</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-habit-pink/20 border-none ring-0">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-habit-pink/40">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Body Care</p>
                    <p className="text-xl font-bold">{stats?.todayBodyCare ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">entries</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Habit summary cards */}
            {stats?.habitSummaries && stats.habitSummaries.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 font-heading">Today&apos;s Habits</h2>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {stats.habitSummaries.map((habit, i) => (
                    <Card
                      key={habit.id}
                      className={`${PASTEL_BG[i % PASTEL_BG.length]} border-none ring-0`}
                    >
                      <CardContent className="flex items-center gap-3 py-4">
                        <CheckCircle
                          className={`size-5 ${
                            habit.completedToday ? "text-primary" : "text-muted-foreground/40"
                          }`}
                        />
                        <span className="text-sm font-medium truncate">{habit.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Weekly View ── */}
        <TabsContent value="weekly">
          <div className="space-y-8 mt-2">
            {/* Weekly stat cards */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Card className="bg-habit-peach/20 border-none ring-0">
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-foreground/70">Habits</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.weeklyHabits
                      ? `${stats.weeklyHabits.completed}/${stats.weeklyHabits.total}`
                      : "--"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">completed this week</p>
                </CardContent>
              </Card>

              <Card className="bg-habit-blue/20 border-none ring-0">
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-foreground/70">Gym Sessions</p>
                  <p className="text-2xl font-bold mt-1">{stats?.weeklyGym ?? "--"}</p>
                  <p className="text-[10px] text-muted-foreground">this week</p>
                </CardContent>
              </Card>

              <Card className="bg-habit-purple/20 border-none ring-0">
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-foreground/70">Total Spent</p>
                  <p className="text-2xl font-bold mt-1">₹{stats?.weeklySpendingTotal ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">this week</p>
                </CardContent>
              </Card>

              <Card className="bg-habit-green/20 border-none ring-0">
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-foreground/70">Avg Calories</p>
                  <p className="text-2xl font-bold mt-1">{stats?.weeklyCaloriesAvg ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">per day</p>
                </CardContent>
              </Card>
            </div>

            {/* Bar charts */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">Daily Calories</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.weeklyCalories ? (
                    <BarChart
                      data={stats.weeklyCalories.map((d) => ({ label: d.day, value: d.value }))}
                      color="#b5e4ca"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">Daily Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.weeklySpending ? (
                    <BarChart
                      data={stats.weeklySpending.map((d) => ({ label: d.day, value: d.value }))}
                      color="#c4b5e0"
                      unit="₹"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                </CardContent>
              </Card>

              <Card className="sm:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">Daily Learning Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.weeklyLearning ? (
                    <BarChart
                      data={stats.weeklyLearning.map((d) => ({ label: d.day, value: d.value }))}
                      color="#f5e6a3"
                      unit="m"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Consistency Heatmap (always visible) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Consistency Map</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.heatmap ? (
            <ConsistencyHeatmap
              data={stats.heatmap}
              maxCount={stats.totalHabits}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading heatmap...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
