"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { IReport, ReportType, ReportStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const TYPE_COLORS: Record<ReportType, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-habit-blue/30 text-blue-700",
};

const TYPE_LABELS: Record<ReportType, string> = {
  bug: "Bug",
  feature: "Feature",
};

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

type FilterType = ReportType | "all";
type FilterStatus = ReportStatus | "all";

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-habit-blue/30 text-blue-700",
  done: "bg-habit-green/30 text-green-700",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<(IReport & { userId?: { username?: string; email?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else if (data.error === "Forbidden") {
        toast.error("Admin access required");
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function updateStatus(id: string, status: ReportStatus) {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r._id.toString() === id ? { ...r, status } : r))
        );
        toast.success("Status updated");
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function deleteReport(id: string) {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.filter((r) => r._id.toString() !== id));
        toast.success("Report deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  const filtered = reports
    .filter((r) => filterType === "all" || r.type === filterType)
    .filter((r) => filterStatus === "all" || r.status === filterStatus);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header>
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Admin Panel
        </h2>
        <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">All Reports</h1>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total</h3>
          <p className="text-3xl font-semibold font-heading">{reports.length}</p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Open</h3>
          <p className="text-3xl font-semibold font-heading">
            {reports.filter((r) => r.status === "open").length}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Done</h3>
          <p className="text-3xl font-semibold font-heading">
            {reports.filter((r) => r.status === "done").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "bug", "feature"] as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === t
                ? "bg-foreground text-background"
                : t === "all"
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : `${TYPE_COLORS[t]} hover:opacity-80`
            }`}
          >
            {t === "all" ? "All Types" : TYPE_LABELS[t]}
          </button>
        ))}
        <span className="w-px bg-border mx-1" />
        {(["all", "open", "in-progress", "done"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-foreground text-background"
                : s === "all"
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : `${STATUS_COLORS[s]} hover:opacity-80`
            }`}
          >
            {s === "all" ? "All Status" : STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">No reports found.</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report._id.toString()}
              className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-5 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        TYPE_COLORS[report.type]
                      }`}
                    >
                      {TYPE_LABELS[report.type]}
                    </span>
                    {report.userId && typeof report.userId === "object" && "username" in report.userId && (
                      <span className="text-xs text-muted-foreground">
                        by {report.userId.username}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {report.description}
                  </p>
                  {report.screenshotUrl && (
                    <a
                      href={report.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      View Screenshot
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={report.status}
                    onValueChange={(v) => updateStatus(report._id.toString(), v as ReportStatus)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => deleteReport(report._id.toString())}
                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
