"use client";

import { useState, useEffect, useRef } from "react";
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
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LogFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (log: IFoodLog) => void;
}

export function LogFoodDialog({ open, onOpenChange, onCreated }: LogFoodDialogProps) {
  const [foodName, setFoodName] = useState("");
  const [quantityGrams, setQuantityGrams] = useState("100");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live search triggered by foodName
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!foodName || foodName.length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(foodName)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        const filtered = (data.products || []).filter(
          (p: any) =>
            p.product_name &&
            p.product_name.trim() !== "" &&
            p.nutriments?.["energy-kcal_100g"] != null &&
            p.nutriments["energy-kcal_100g"] >= 0
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [foodName]);

  function selectFood(product: any) {
    setFoodName(product.product_name || "Unknown Food");
    const nutriments = product.nutriments || {};
    const kcal = nutriments["energy-kcal_100g"];
    setCalories(kcal != null && kcal >= 0 ? String(Math.round(kcal)) : "");
    setProtein(nutriments.proteins_100g != null && nutriments.proteins_100g >= 0 ? String(Math.round(nutriments.proteins_100g * 10) / 10) : "");
    setCarbs(nutriments.carbohydrates_100g != null && nutriments.carbohydrates_100g >= 0 ? String(Math.round(nutriments.carbohydrates_100g * 10) / 10) : "");
    setFat(nutriments.fat_100g != null && nutriments.fat_100g >= 0 ? String(Math.round(nutriments.fat_100g * 10) / 10) : "");
    setQuantityGrams("100");
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const grams = parseFloat(quantityGrams || "100");
    const cal = parseFloat(calories || "0");
    if (cal < 0 || grams <= 0) return;

    setLoading(true);

    // Values entered are per 100g. Scale by grams/100.
    const scale = grams / 100;

    try {
      const res = await fetch("/api/food-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mealType,
          foodName,
          quantity: 1,
          servingSize: grams,
          calories: cal * scale,
          protein: protein ? parseFloat(protein) * scale : undefined,
          carbs: carbs ? parseFloat(carbs) * scale : undefined,
          fat: fat ? parseFloat(fat) * scale : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onCreated(data.data);
        setFoodName("");
        setQuantityGrams("100");
        setCalories("");
        setProtein("");
        setCarbs("");
        setFat("");
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to log food");
      }
    } catch {
      toast.error("Failed to log food");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Food</DialogTitle>
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

          {/* Food name = search field */}
          <div className="space-y-2">
            <Label>Food Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Chicken Biryani, Poha, Banana..."
                className="pl-9"
                required
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="border rounded-xl divide-y max-h-48 overflow-y-auto">
                {searchResults.map((p, i) => (
                  <div
                    key={p.code || i}
                    className="p-2.5 hover:bg-muted cursor-pointer text-sm transition-colors"
                    onClick={() => selectFood(p)}
                  >
                    <p className="font-medium">{p.product_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {Math.round(p.nutriments["energy-kcal_100g"])} kcal
                      {p.nutriments.proteins_100g != null && ` · ${Math.round(p.nutriments.proteins_100g)}g protein`}
                      {" "}per 100g
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-habit-green/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-green-700">Quantity (g)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantityGrams}
                onChange={(e) => setQuantityGrams(e.target.value)}
                placeholder="grams"
                className="border-green-200 bg-white/60 h-8 text-sm"
                required
              />
            </div>
            <div className="rounded-xl bg-habit-peach/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-orange-700">Calories</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                className="border-orange-200 bg-white/60 h-8 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-habit-pink/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-pink-700">Protein</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="g"
                className="border-pink-200 bg-white/60 h-8 text-sm"
              />
            </div>
            <div className="rounded-xl bg-habit-blue/20 p-3 space-y-1">
              <Label className="text-xs font-semibold text-blue-700">Carbs</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="g"
                className="border-blue-200 bg-white/60 h-8 text-sm"
              />
            </div>
            <div className="rounded-xl bg-habit-yellow/30 p-3 space-y-1">
              <Label className="text-xs font-semibold text-yellow-700">Fat</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="g"
                className="border-yellow-200 bg-white/60 h-8 text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging..." : "Log Food"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
