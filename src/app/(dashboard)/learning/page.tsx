"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Clock, Tag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddLearningDialog } from "@/components/learning/add-learning-dialog";
import { EditLearningDialog } from "@/components/learning/edit-learning-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ILearning, LearningCategory } from "@/types";
import { toast } from "sonner";

type ViewMode = "daily" | "weekly" | "all";

const CATEGORY_COLORS: Record<LearningCategory, string> = {
  dsa: "bg-habit-pink/30 text-habit-pink",
  lld: "bg-habit-purple/30 text-habit-purple",
  hld: "bg-habit-blue/30 text-habit-blue",
  frontend: "bg-habit-yellow/40 text-yellow-700",
  backend: "bg-habit-green/30 text-habit-green",
  devops: "bg-habit-peach/30 text-orange-700",
  general: "bg-muted text-muted-foreground",
  work: "bg-primary/10 text-primary",
};

const CATEGORY_LABELS: Record<LearningCategory, string> = {
  dsa: "DSA",
  lld: "LLD",
  hld: "HLD",
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  general: "General",
  work: "Work",
};

function getToday(): string {
  return new Date().toISOString().split("T")[0];
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

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: first.toISOString().split("T")[0],
    end: last.toISOString().split("T")[0],
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function LearningPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editLearning, setEditLearning] = useState<ILearning | null>(null);
  const [learnings, setLearnings] = useState<ILearning[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<LearningCategory | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLearnings = useCallback(async () => {
    setLoading(true);
    try {
      let url: string;
      if (viewMode === "daily") {
        url = `/api/learnings?date=${getToday()}`;
      } else if (viewMode === "weekly") {
        const { start, end } = getWeekRange();
        url = `/api/learnings?startDate=${start}&endDate=${end}`;
      } else {
        const { start, end } = getMonthRange();
        url = `/api/learnings?startDate=${start}&endDate=${end}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLearnings(data.data);
      }
    } catch {
      toast.error("Failed to load learnings");
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchLearnings();
  }, [fetchLearnings]);

  async function deleteLearning() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/learnings/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLearnings((prev) => prev.filter((l) => l._id.toString() !== deleteId));
        toast.success("Learning deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const filtered =
    filterCategory === "all"
      ? learnings
      : learnings.filter((l) => l.category === filterCategory);

  const totalMinutes = filtered.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalEntries = filtered.length;

  // Count per category
  const categoryCounts = learnings.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Learning Journal
          </h2>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">
            {viewMode === "daily"
              ? "Today's Learnings"
              : viewMode === "weekly"
              ? "This Week"
              : "This Month"}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["daily", "weekly", "all"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {mode === "daily" ? "Today" : mode === "weekly" ? "Week" : "Month"}
              </button>
            ))}
          </div>
          <Button
            className="rounded-xl gap-2 font-medium"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="size-4" />
            Log Learning
          </Button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Entries</h3>
          <p className="text-3xl font-semibold font-heading">{totalEntries}</p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Time Spent</h3>
          <p className="text-3xl font-semibold font-heading">
            {totalMinutes >= 60
              ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
              : `${totalMinutes}m`}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6 col-span-2 md:col-span-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Top Category</h3>
          {Object.keys(categoryCounts).length > 0 ? (
            <p className="text-3xl font-semibold font-heading">
              {CATEGORY_LABELS[
                Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0] as LearningCategory
              ]}
            </p>
          ) : (
            <p className="text-3xl font-semibold font-heading text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterCategory === "all"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as LearningCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === cat
                ? "bg-foreground text-background"
                : `${CATEGORY_COLORS[cat]} hover:opacity-80`
            }`}
          >
            {CATEGORY_LABELS[cat]}
            {categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ""}
          </button>
        ))}
      </div>

      {/* Learning entries */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No learnings logged{" "}
              {viewMode === "daily"
                ? "today"
                : viewMode === "weekly"
                ? "this week"
                : "this month"}
              {filterCategory !== "all" && ` in ${CATEGORY_LABELS[filterCategory]}`}.
            </p>
          </div>
        ) : (
          filtered.map((learning) => (
            <div
              key={learning._id.toString()}
              className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-5 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        CATEGORY_COLORS[learning.category]
                      }`}
                    >
                      {CATEGORY_LABELS[learning.category]}
                    </span>
                    {learning.durationMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {learning.durationMinutes}m
                      </span>
                    )}
                    {viewMode !== "daily" && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(learning.date)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{learning.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {learning.content}
                  </p>
                  {learning.tags && learning.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Tag className="size-3 text-muted-foreground" />
                      {learning.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditLearning(learning)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <button
                    onClick={() => setDeleteId(learning._id.toString())}
                    className="text-destructive p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddLearningDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={(newLearning) => setLearnings((prev) => [newLearning, ...prev])}
      />

      <EditLearningDialog
        open={editLearning !== null}
        onOpenChange={(open) => { if (!open) setEditLearning(null); }}
        learning={editLearning}
        onUpdated={(updated) => {
          setLearnings((prev) => prev.map((l) => l._id.toString() === updated._id.toString() ? updated : l));
          setEditLearning(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteLearning}
        title="Delete Learning?"
        description="This will permanently delete this learning entry."
        loading={deleting}
      />
    </div>
  );
}
