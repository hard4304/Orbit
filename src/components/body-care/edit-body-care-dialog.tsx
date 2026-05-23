"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { IBodyCareLog, BodyCareType } from "@/types";
import { toast } from "sonner";

interface EditBodyCareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: IBodyCareLog | null;
  onUpdated: (log: IBodyCareLog) => void;
}

const TYPES: { value: BodyCareType; label: string }[] = [
  { value: "skincare", label: "Skincare" },
  { value: "haircare", label: "Haircare" },
  { value: "bodycare", label: "Body Care" },
  { value: "other", label: "Other" },
];

export function EditBodyCareDialog({ open, onOpenChange, log, onUpdated }: EditBodyCareDialogProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<BodyCareType>("skincare");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [products, setProducts] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (log) {
      setTitle(log.title);
      setNotes(log.notes ?? "");
      setType(log.type);
      setDate(log.date);
      setProducts(log.products?.join(", ") ?? "");
    }
  }, [log]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!log) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/body-care/${log._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type,
          title,
          notes: notes || undefined,
          products: products ? products.split(",").map((p) => p.trim()).filter(Boolean) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onUpdated(data.data);
        onOpenChange(false);
        toast.success("Log updated");
      } else {
        toast.error(data.error || "Failed to update log");
      }
    } catch {
      toast.error("Failed to update log");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Body Care Log</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as BodyCareType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Products (comma-separated)</Label>
            <Input
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="e.g. CeraVe cleanser, Niacinamide serum"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
