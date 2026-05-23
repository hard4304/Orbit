"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IWorkout } from "@/types";
import { toast } from "sonner";

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<IWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch("/api/workouts");
        const data = await res.json();
        if (data.success) setWorkouts(data.data);
      } catch {
        toast.error("Failed to load workouts");
      } finally {
        setLoading(false);
      }
    }
    fetchWorkouts();
  }, []);

  async function deleteWorkout(id: string) {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setWorkouts((prev) => prev.filter((w) => w._id.toString() !== id));
      toast.success("Workout deleted");
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm">Loading workouts...</div>;

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No workouts logged yet. Start a Gym Mode session to auto-log your first workout.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <Card key={workout._id.toString()}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{workout.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{workout.date}</span>
                {workout.duration && (
                  <Badge variant="secondary" className="text-xs">
                    {workout.duration} min
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                  onClick={() => deleteWorkout(workout._id.toString())}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workout.exercises.map((exercise, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="text-xs shrink-0">
                    {exercise.muscleGroup}
                  </Badge>
                  <div>
                    <span className="font-medium">{exercise.name}</span>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {exercise.sets.map((set, j) => (
                        <span key={j}>
                          {j > 0 && " | "}
                          {set.weight}kg x {set.reps}
                          {set.restTime ? ` (${set.restTime}s rest)` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
