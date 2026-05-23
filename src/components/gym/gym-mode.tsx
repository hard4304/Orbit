"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IGymSession, MuscleGroup } from "@/types";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "legs", "core", "cardio", "full_body",
];

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface GymModeProps {
  initialSession: IGymSession | null;
  onSessionChange: (session: IGymSession | null) => void;
}

export function GymMode({ initialSession, onSessionChange }: GymModeProps) {
  const [session, setSession] = useState<IGymSession | null>(initialSession);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [loading, setLoading] = useState(false);

  // New exercise form
  const [exerciseName, setExerciseName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("chest");

  // New set form
  const [setWeight, setSetWeight] = useState("");
  const [setReps, setSetReps] = useState("");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);

  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session elapsed timer
  useEffect(() => {
    if (!session) return;

    const startTime = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Rest timer
  useEffect(() => {
    if (isResting) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => prev + 1);
      }, 1000);
    } else if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting]);

  const updateSessionState = useCallback((newSession: IGymSession) => {
    setSession(newSession);
    onSessionChange(newSession);
  }, [onSessionChange]);

  async function startSession() {
    setLoading(true);
    try {
      const res = await fetch("/api/gym-sessions", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        updateSessionState(data.data);
        toast.success("Gym session started!");
      }
    } catch {
      toast.error("Failed to start session");
    } finally {
      setLoading(false);
    }
  }

  async function addExercise() {
    if (!session || !exerciseName.trim()) return;

    const res = await fetch(`/api/gym-sessions/${session._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-exercise",
        data: { name: exerciseName.trim(), muscleGroup },
      }),
    });
    const data = await res.json();
    if (data.success) {
      updateSessionState(data.data);
      setExerciseName("");
      setActiveExerciseIndex(data.data.exercises.length - 1);
      toast.success("Exercise added");
    }
  }

  async function addSet() {
    if (!session || activeExerciseIndex === null || !setWeight || !setReps) return;

    const res = await fetch(`/api/gym-sessions/${session._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-set",
        data: {
          exerciseIndex: activeExerciseIndex,
          weight: parseFloat(setWeight),
          reps: parseInt(setReps),
          restTime: isResting ? restTimer : undefined,
        },
      }),
    });
    const data = await res.json();
    if (data.success) {
      updateSessionState(data.data);
      setSetWeight("");
      setSetReps("");
      // Auto-start rest timer
      setRestTimer(0);
      setIsResting(true);
      toast.success("Set logged!");
    }
  }

  async function removeSet(exerciseIndex: number, setIndex: number) {
    if (!session) return;

    const res = await fetch(`/api/gym-sessions/${session._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remove-set",
        data: { exerciseIndex, setIndex },
      }),
    });
    const data = await res.json();
    if (data.success) {
      updateSessionState(data.data);
    } else {
      toast.error("Failed to remove set");
    }
  }

  async function endSession() {
    if (!session) return;
    setLoading(true);

    const res = await fetch(`/api/gym-sessions/${session._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end" }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSession(null);
      onSessionChange(null);
      setIsResting(false);
      setRestTimer(0);
      setActiveExerciseIndex(null);
      toast.success("Session ended and saved to workout history!");
    }
  }

  // ==================== No Active Session ====================
  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to work out?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Start a gym session to track exercises, sets, weights, and rest times in real-time.
          </p>
          <Button size="lg" onClick={startSession} disabled={loading}>
            {loading ? "Starting..." : "Start Gym Session"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==================== Active Session ====================
  return (
    <div className="space-y-4">
      {/* Session Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Session Time</div>
                <div className="text-2xl font-mono font-bold">{formatTime(elapsed)}</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Exercises</div>
                <div className="text-2xl font-bold">{session.exercises.length}</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Sets</div>
                <div className="text-2xl font-bold">
                  {session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}
                </div>
              </div>
            </div>
            <Button variant="destructive" onClick={endSession} disabled={loading}>
              {loading ? "Ending..." : "End Session"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      <Card className={isResting ? "border-orange-500/50" : ""}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Rest Timer</div>
              <div className={`text-3xl font-mono font-bold ${isResting ? "text-orange-500" : ""}`}>
                {formatTime(restTimer)}
              </div>
            </div>
            <div className="flex gap-2">
              {!isResting ? (
                <Button
                  variant="outline"
                  onClick={() => { setRestTimer(0); setIsResting(true); }}
                >
                  Start Rest
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsResting(false)}
                >
                  Stop Rest
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => { setRestTimer(0); setIsResting(false); }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Add Exercise */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Exercise Name</Label>
              <Input
                placeholder="e.g., Bench Press"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExercise()}
              />
            </div>
            <div className="space-y-2">
              <Label>Muscle Group</Label>
              <Select value={muscleGroup} onValueChange={(v) => setMuscleGroup(v as MuscleGroup)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((mg) => (
                    <SelectItem key={mg} value={mg}>
                      {mg.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addExercise} className="w-full" disabled={!exerciseName.trim()}>
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        {/* Log Set */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log Set</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add an exercise first</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Exercise</Label>
                  <Select
                    value={activeExerciseIndex?.toString() ?? ""}
                    onValueChange={(v) => setActiveExerciseIndex(v ? parseInt(v) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {session.exercises.map((ex, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {ex.name} ({ex.sets.length} sets)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={setWeight}
                      onChange={(e) => setSetWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={setReps}
                      onChange={(e) => setSetReps(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSet()}
                    />
                  </div>
                </div>
                <Button
                  onClick={addSet}
                  className="w-full"
                  disabled={activeExerciseIndex === null || !setWeight || !setReps}
                >
                  Log Set
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Log */}
      {session.exercises.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Session Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.exercises.map((exercise, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{exercise.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {exercise.muscleGroup.replace("_", " ")}
                    </Badge>
                  </div>
                  {exercise.sets.length === 0 ? (
                    <p className="text-xs text-muted-foreground ml-2">No sets yet</p>
                  ) : (
                    <div className="ml-2 space-y-1">
                      {exercise.sets.map((set, j) => (
                        <div key={j} className="flex items-center gap-3 text-sm group/set">
                          <span className="text-muted-foreground w-16">Set {set.setNumber}</span>
                          <span className="font-mono">{set.weight} kg</span>
                          <span className="text-muted-foreground">x</span>
                          <span className="font-mono">{set.reps} reps</span>
                          {set.restTime !== undefined && set.restTime > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({formatTime(set.restTime)} rest)
                            </span>
                          )}
                          <button
                            onClick={() => removeSet(i, j)}
                            className="ml-auto opacity-0 group-hover/set:opacity-100 text-destructive transition-opacity"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {i < session.exercises.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
