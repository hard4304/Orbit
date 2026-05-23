"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogFoodDialog } from "@/components/food/log-food-dialog";
import { EditFoodDialog } from "@/components/food/edit-food-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IFoodLog, MealType } from "@/types";
import { toast } from "sonner";

type ViewMode = "daily" | "weekly";
type MealFilter = "all" | MealType;

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function FoodPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editLog, setEditLog] = useState<IFoodLog | null>(null);
  const [foodLogs, setFoodLogs] = useState<IFoodLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url: string;
      if (viewMode === "daily") {
        url = `/api/food-logs?date=${getToday()}`;
      } else {
        const { start, end } = getWeekRange();
        url = `/api/food-logs?startDate=${start}&endDate=${end}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFoodLogs(data.data);
      }
    } catch {
      toast.error("Failed to load food logs");
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function deleteLog() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/food-logs/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFoodLogs((prev) => prev.filter((l) => l._id.toString() !== deleteId));
        toast.success("Food log deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = mealFilter === "all"
    ? foodLogs
    : foodLogs.filter((l) => l.mealType === mealFilter);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFat = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const daysWithData = viewMode === "weekly"
    ? new Set(foodLogs.map((l) => l.date)).size || 1
    : 1;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Food Tracker
          </h2>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">
            {viewMode === "daily" ? "Today's Nutrition" : "This Week"}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "daily"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "weekly"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              This Week
            </button>
          </div>
          <Button
            className="rounded-xl gap-2 font-medium"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="size-4" />
            Log Food
          </Button>
        </div>
      </header>

      {/* Nutrition summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {viewMode === "weekly" ? "Total Calories" : "Calories"}
          </h3>
          <p className="text-2xl font-semibold font-heading">
            {Math.round(totalCalories)}{" "}
            <span className="text-sm text-muted-foreground font-sans">kcal</span>
          </p>
          {viewMode === "weekly" && (
            <p className="text-xs text-muted-foreground mt-1">
              ~{Math.round(totalCalories / daysWithData)}/day avg
            </p>
          )}
        </div>
        <div className="bg-habit-pink/20 border-none ring-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Protein</h3>
          <p className="text-2xl font-semibold font-heading">{Math.round(totalProtein)}g</p>
          {viewMode === "weekly" && (
            <p className="text-xs text-muted-foreground mt-1">
              ~{Math.round(totalProtein / daysWithData)}g/day
            </p>
          )}
        </div>
        <div className="bg-habit-blue/20 border-none ring-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Carbs</h3>
          <p className="text-2xl font-semibold font-heading">{Math.round(totalCarbs)}g</p>
          {viewMode === "weekly" && (
            <p className="text-xs text-muted-foreground mt-1">
              ~{Math.round(totalCarbs / daysWithData)}g/day
            </p>
          )}
        </div>
        <div className="bg-habit-yellow/30 border-none ring-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Fat</h3>
          <p className="text-2xl font-semibold font-heading">{Math.round(totalFat)}g</p>
          {viewMode === "weekly" && (
            <p className="text-xs text-muted-foreground mt-1">
              ~{Math.round(totalFat / daysWithData)}g/day
            </p>
          )}
        </div>
      </div>

      {/* Food log list */}
      <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-heading">
            {viewMode === "daily" ? "Food Log" : "This Week's Log"}
          </h3>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "breakfast", "lunch", "dinner", "snack"] as MealFilter[]).map((m) => (
              <button
                key={m}
                onClick={() => setMealFilter(m)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  mealFilter === m
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No food logged
            {mealFilter !== "all" ? ` for ${mealFilter}` : ""}
            {viewMode === "daily" ? " today" : " this week"}.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => (
              <div
                key={log._id.toString()}
                className="flex justify-between items-start border-b pb-3 group"
              >
                <div className="space-y-1.5">
                  <p className="font-medium text-sm">{log.foodName}</p>
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="bg-habit-peach/25 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                      {Math.round(log.calories)} kcal
                    </span>
                    {log.protein != null && (
                      <span className="bg-habit-pink/20 text-pink-700 px-1.5 py-0.5 rounded font-medium">
                        {Math.round(log.protein)}g P
                      </span>
                    )}
                    {log.carbs != null && (
                      <span className="bg-habit-blue/20 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        {Math.round(log.carbs)}g C
                      </span>
                    )}
                    {log.fat != null && (
                      <span className="bg-habit-yellow/30 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                        {Math.round(log.fat)}g F
                      </span>
                    )}
                    {viewMode === "weekly" && (
                      <span className="text-muted-foreground">{formatDate(log.date)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium capitalize bg-muted px-3 py-1.5 rounded-lg">
                    {log.mealType}
                  </span>
                  <div className="flex items-center gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditLog(log)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <button
                      onClick={() => setDeleteId(log._id.toString())}
                      className="text-destructive p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LogFoodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={(newLog) => {
          setFoodLogs((prev) => [newLog, ...prev]);
        }}
      />

      <EditFoodDialog
        open={editLog !== null}
        onOpenChange={(open) => { if (!open) setEditLog(null); }}
        log={editLog}
        onUpdated={(updated) => {
          setFoodLogs((prev) => prev.map((l) => l._id.toString() === updated._id.toString() ? updated : l));
          setEditLog(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteLog}
        title="Delete Food Log?"
        description="This will permanently delete this food log entry."
        loading={deleting}
      />
    </div>
  );
}
