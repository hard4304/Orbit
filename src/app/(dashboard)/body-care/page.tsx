"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pill, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBodyCareDialog } from "@/components/body-care/add-body-care-dialog";
import { EditBodyCareDialog } from "@/components/body-care/edit-body-care-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IBodyCareLog, BodyCareType } from "@/types";
import { toast } from "sonner";

type ViewMode = "daily" | "weekly" | "monthly";

const TYPE_COLORS: Record<BodyCareType, string> = {
  skincare: "bg-habit-pink/30 text-habit-pink",
  haircare: "bg-habit-blue/30 text-habit-blue",
  bodycare: "bg-habit-green/30 text-habit-green",
  other: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<BodyCareType, string> = {
  skincare: "Skincare",
  haircare: "Haircare",
  bodycare: "Body Care",
  other: "Other",
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

export default function BodyCarePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editLog, setEditLog] = useState<IBodyCareLog | null>(null);
  const [logs, setLogs] = useState<IBodyCareLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<BodyCareType | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url: string;
      if (viewMode === "daily") {
        url = `/api/body-care?date=${getToday()}`;
      } else if (viewMode === "weekly") {
        const { start, end } = getWeekRange();
        url = `/api/body-care?startDate=${start}&endDate=${end}`;
      } else {
        const { start, end } = getMonthRange();
        url = `/api/body-care?startDate=${start}&endDate=${end}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch {
      toast.error("Failed to load body care logs");
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
      const res = await fetch(`/api/body-care/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((l) => l._id.toString() !== deleteId));
        toast.success("Log deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const filtered =
    filterType === "all" ? logs : logs.filter((l) => l.type === filterType);

  const totalEntries = filtered.length;

  const typeCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  const allProducts = filtered.flatMap((l) => l.products || []);
  const uniqueProducts = new Set(allProducts).size;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Self Care Log
          </h2>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">
            {viewMode === "daily"
              ? "Body Care"
              : viewMode === "weekly"
              ? "This Week"
              : "This Month"}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
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
            Log Care
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
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Products Used</h3>
          <p className="text-3xl font-semibold font-heading">{uniqueProducts}</p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6 col-span-2 md:col-span-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Top Type</h3>
          {Object.keys(typeCounts).length > 0 ? (
            <p className="text-3xl font-semibold font-heading">
              {TYPE_LABELS[
                Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0] as BodyCareType
              ]}
            </p>
          ) : (
            <p className="text-3xl font-semibold font-heading text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterType === "all"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {(Object.keys(TYPE_LABELS) as BodyCareType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === type
                ? "bg-foreground text-background"
                : `${TYPE_COLORS[type]} hover:opacity-80`
            }`}
          >
            {TYPE_LABELS[type]}
            {typeCounts[type] ? ` (${typeCounts[type]})` : ""}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No body care logs{" "}
              {viewMode === "daily"
                ? "today"
                : viewMode === "weekly"
                ? "this week"
                : "this month"}
              {filterType !== "all" && ` in ${TYPE_LABELS[filterType]}`}.
            </p>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log._id.toString()}
              className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-5 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        TYPE_COLORS[log.type]
                      }`}
                    >
                      {TYPE_LABELS[log.type]}
                    </span>
                    {viewMode !== "daily" && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.date)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{log.title}</h3>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {log.notes}
                    </p>
                  )}
                  {log.products && log.products.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Pill className="size-3 text-muted-foreground" />
                      {log.products.map((product) => (
                        <span
                          key={product}
                          className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
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
          ))
        )}
      </div>

      <AddBodyCareDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={(newLog) => setLogs((prev) => [newLog, ...prev])}
      />

      <EditBodyCareDialog
        open={editLog !== null}
        onOpenChange={(open) => { if (!open) setEditLog(null); }}
        log={editLog}
        onUpdated={(updated) => {
          setLogs((prev) => prev.map((l) => l._id.toString() === updated._id.toString() ? updated : l));
          setEditLog(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteLog}
        title="Delete Log?"
        description="This will permanently delete this body care log."
        loading={deleting}
      />
    </div>
  );
}
