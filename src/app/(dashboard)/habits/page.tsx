"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { EditHabitDialog } from "@/components/habits/edit-habit-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IHabit, IHabitLog } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const CARD_COLORS = [
  "bg-habit-pink/30",
  "bg-habit-green/30",
  "bg-habit-purple/30",
  "bg-habit-peach/30",
  "bg-habit-blue/30",
  "bg-habit-yellow/30",
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [logs, setLogs] = useState<IHabitLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<IHabit | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const weekDates = getWeekDates();
  const today = getToday();

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, logsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/habits?logs=true&start=${weekDates[0]}&end=${weekDates[6]}`),
      ]);
      const habitsData = await habitsRes.json();
      if (habitsData.success) setHabits(habitsData.data);

      const logsData = await logsRes.json();
      if (logsData.success && Array.isArray(logsData.data)) {
        setLogs(logsData.data);
      }
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, [weekDates]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleHabit(habitId: string, date: string, currentlyCompleted: boolean) {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, completed: !currentlyCompleted }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => {
          const filtered = prev.filter(
            (l) => !(l.habitId?.toString() === habitId && l.date === date)
          );
          return [...filtered, data.data];
        });
      }
    } catch {
      toast.error("Failed to update habit");
    }
  }

  function isCompleted(habitId: string, date: string): boolean {
    return logs.some(
      (l) => l.habitId?.toString() === habitId && l.date === date && l.completed
    );
  }

  async function deleteHabit() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.filter((h) => h._id.toString() !== deleteId));
        toast.success("Habit deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete habit");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading habits...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground text-sm">Track your daily routines</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit, i) => (
          <Card
            key={habit._id.toString()}
            className={`${CARD_COLORS[i % CARD_COLORS.length]} border-none ring-0 relative group`}
          >
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="font-semibold text-sm">{habit.name}</span>
                </div>
                <div className="flex items-center gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditHabit(habit)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(habit._id.toString())}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Day indicators */}
              <div className="flex items-center justify-between gap-1">
                {weekDates.map((date, di) => {
                  const completed = isCompleted(habit._id.toString(), date);
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      onClick={() => toggleHabit(habit._id.toString(), date, completed)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`text-[10px] font-medium ${
                          isToday ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {DAY_LABELS[di]}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          completed
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-muted-foreground/20"
                        } ${isToday && !completed ? "border-primary/50" : ""}`}
                      >
                        {completed && (
                          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Habit card */}
        <Card
          className="border-2 border-dashed border-muted-foreground/20 bg-transparent ring-0 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Plus className="size-8" />
            <span className="text-sm font-medium">Add Habit</span>
          </CardContent>
        </Card>
      </div>

      <AddHabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(habit) => {
          setHabits((prev) => [habit, ...prev]);
          setDialogOpen(false);
          toast.success("Habit created");
        }}
      />

      <EditHabitDialog
        open={editHabit !== null}
        onOpenChange={(open) => { if (!open) setEditHabit(null); }}
        habit={editHabit}
        onUpdated={(updated) => {
          setHabits((prev) => prev.map((h) => h._id.toString() === updated._id.toString() ? updated : h));
          setEditHabit(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteHabit}
        title="Delete Habit?"
        description="This will permanently delete this habit and all its log history."
        loading={deleting}
      />
    </div>
  );
}
