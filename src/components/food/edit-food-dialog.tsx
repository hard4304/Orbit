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
import { IFoodLog, MealType } from "@/types";
import { toast } from "sonner";

interface EditFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: IFoodLog | null;
  onUpdated: (log: IFoodLog) => void;
}

export function EditFoodDialog({ open, onOpenChange, log, onUpdated }: EditFoodDialogProps) {
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (log) {
      setFoodName(log.foodName);
      setMealType(log.mealType);
      setDate(log.date);
      setCalories(String(Math.round(log.calories * 10) / 10));
      setProtein(log.protein != null ? String(Math.round(log.protein * 10) / 10) : "");
      setCarbs(log.carbs != null ? String(Math.round(log.carbs * 10) / 10) : "");
      setFat(log.fat != null ? String(Math.round(log.fat * 10) / 10) : "");
    }
  }, [log]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!log) return;
    const cal = parseFloat(calories || "0");
    if (cal < 0) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/food-logs/${log._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName,
          mealType,
          date,
          calories: cal,
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onUpdated(data.data);
        onOpenChange(false);
        toast.success("Food log updated");
      } else {
        toast.error(data.error || "Failed to update food log");
      }
    } catch {
      toast.error("Failed to update food log");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Food Log</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meal</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Food Name</Label>
            <Input
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-habit-peach/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-orange-700">Calories (kcal)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="border-orange-200 bg-white/60 h-8 text-sm"
                required
              />
            </div>
            <div className="rounded-xl bg-habit-pink/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-pink-700">Protein (g)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="border-pink-200 bg-white/60 h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-habit-blue/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-blue-700">Carbs (g)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="border-blue-200 bg-white/60 h-8 text-sm"
              />
            </div>
            <div className="rounded-xl bg-habit-yellow/30 p-3 space-y-1">
              <Label className="text-xs font-semibold text-yellow-700">Fat (g)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="border-yellow-200 bg-white/60 h-8 text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
