"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog";
import { EditExpenseDialog } from "@/components/finance/edit-expense-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IExpense } from "@/types";
import { toast } from "sonner";

type ViewMode = "daily" | "monthly";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function FinancePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<IExpense | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string;
      if (viewMode === "daily") {
        startDate = getToday();
        endDate = getToday();
      } else {
        const range = getMonthRange();
        startDate = range.start;
        endDate = range.end;
      }
      const res = await fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function deleteExpense() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((e) => e._id.toString() !== deleteId));
        toast.success("Expense deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const txCount = expenses.length;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
      <header className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Personal Finance
          </h2>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground mt-1">
            {viewMode === "daily" ? "Today's Expenses" : "This Month"}
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
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              This Month
            </button>
          </div>
          <Button
            className="rounded-xl gap-2 font-medium"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add Expense
          </Button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {viewMode === "daily" ? "Spent Today" : "Total Spent This Month"}
          </h3>
          <p className="text-3xl font-semibold font-heading">₹{totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Transactions</h3>
          <p className="text-3xl font-semibold font-heading">{txCount}</p>
          {viewMode === "monthly" && txCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              ~₹{Math.round(totalSpent / txCount)} avg per transaction
            </p>
          )}
        </div>
      </div>

      {/* Expense list */}
      <div className="bg-white/50 backdrop-blur border border-sidebar-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold font-heading mb-4">
          {viewMode === "daily" ? "Today's Expenses" : "Recent Expenses"}
        </h3>
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No expenses{viewMode === "daily" ? " today" : " this month"}.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense._id.toString()}
                className="flex justify-between items-center border-b pb-2 group"
              >
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {expense.category} · {expense.medium}
                    {viewMode === "monthly" && ` · ${formatDate(expense.date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-sm text-habit-pink">
                      -₹{expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditExpense(expense)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <button
                      onClick={() => setDeleteId(expense._id.toString())}
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

      <AddExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={(newExpense) => setExpenses((prev) => [newExpense, ...prev])}
      />

      <EditExpenseDialog
        open={editExpense !== null}
        onOpenChange={(open) => { if (!open) setEditExpense(null); }}
        expense={editExpense}
        onUpdated={(updated) => {
          setExpenses((prev) => prev.map((e) => e._id.toString() === updated._id.toString() ? updated : e));
          setEditExpense(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={deleteExpense}
        title="Delete Expense?"
        description="This will permanently delete this expense."
        loading={deleting}
      />
    </div>
  );
}
