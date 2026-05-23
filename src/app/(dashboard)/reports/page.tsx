"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddReportDialog } from "@/components/reports/add-report-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IReport, ReportType, ReportStatus } from "@/types";
import { toast } from "sonner";

const TYPE_COLORS: Record<ReportType, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-habit-blue/30 text-blue-700",
};

const TYPE_LABELS: Record<ReportType, string> = {
  bug: "Bug",
  feature: "Feature",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-habit-blue/30 text-blue-700",
  done: "bg-habit-green/30 text-green-700",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  done: "Done",
};

type FilterType = ReportType | "all";
type FilterStatus = ReportStatus | "all";

export default function ReportsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
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

  async function deleteReport() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.filter((r) => r._id.toString() !== deleteId));
        toast.success("Report deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = reports
    .filter((r) => filterType === "all" || r.type === filterType)
    .filter((r) => filterStatus === "all" || r.status === filterStatus);

  const totalReports = reports.length;
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Bug & Feature Reports
          </h2>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">Feedback</h1>
        </div>
        <Button
          className="rounded-xl gap-2 font-medium mt-4 md:mt-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="size-4" />
          New Report
        </Button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Reports</h3>
          <p className="text-3xl font-semibold font-heading">{totalReports}</p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Open</h3>
          <p className="text-3xl font-semibold font-heading">{openCount}</p>
        </div>
      </div>

      {/* Filter chips */}
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
            {s === "all" ? "All Status" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Report entries */}
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
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        STATUS_COLORS[report.status]
                      }`}
                    >
                      {STATUS_LABELS[report.status]}
                    </span>
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
                <button
                  onClick={() => setDeleteId(report._id.toString())}
                  className="max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-destructive transition-opacity shrink-0"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={(newReport) => setReports((prev) => [newReport, ...prev])}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteReport}
        title="Delete Report?"
        description="This will permanently delete this report."
        loading={deleting}
      />
    </div>
  );
}
