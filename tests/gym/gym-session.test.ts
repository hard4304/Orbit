import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";

describe("Gym Session Lifecycle", () => {
  let sessionId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should start a new gym session", async () => {
    const res = await client.post("/api/gym-sessions");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.isActive).toBe(true);
    expect(data.exercises).toEqual([]);
    expect(data.startedAt).toBeDefined();

    sessionId = data._id as string;
  });

  it("should return active session on GET", async () => {
    const res = await client.get("/api/gym-sessions");

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data._id).toBe(sessionId);
    expect(data.isActive).toBe(true);
  });

  it("should add an exercise to the session", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-exercise",
      data: { name: "Bench Press", muscleGroup: "chest" },
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    const exercises = data.exercises as Array<Record<string, unknown>>;
    expect(exercises).toHaveLength(1);
    expect(exercises[0].name).toBe("Bench Press");
    expect(exercises[0].muscleGroup).toBe("chest");
  });

  it("should add a set to the exercise", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-set",
      data: { exerciseIndex: 0, weight: 60, reps: 10, restTime: 90 },
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    const exercises = data.exercises as Array<Record<string, unknown>>;
    const sets = exercises[0].sets as Array<Record<string, unknown>>;
    expect(sets).toHaveLength(1);
    expect(sets[0].weight).toBe(60);
    expect(sets[0].reps).toBe(10);
    expect(sets[0].restTime).toBe(90);
    expect(sets[0].setNumber).toBe(1);
  });

  it("should add a second set with auto-incremented set number", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-set",
      data: { exerciseIndex: 0, weight: 65, reps: 8 },
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    const exercises = data.exercises as Array<Record<string, unknown>>;
    const sets = exercises[0].sets as Array<Record<string, unknown>>;
    expect(sets).toHaveLength(2);
    expect(sets[1].setNumber).toBe(2);
    expect(sets[1].weight).toBe(65);
  });

  it("should add a second exercise", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-exercise",
      data: { name: "Incline Dumbbell Press", muscleGroup: "chest" },
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    const exercises = data.exercises as Array<Record<string, unknown>>;
    expect(exercises).toHaveLength(2);
    expect(exercises[1].name).toBe("Incline Dumbbell Press");
  });

  it("should reject set with out-of-bounds exercise index", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-set",
      data: { exerciseIndex: 99, weight: 50, reps: 10 },
    });

    expect(res.status).toBe(404);
  });

  it("should reject invalid action", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "fly-to-moon",
    });

    expect(res.status).toBe(400);
  });

  it("should end session and create a workout", async () => {
    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "end",
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;

    const session = data.session as Record<string, unknown>;
    expect(session.isActive).toBe(false);
    expect(session.endedAt).toBeDefined();

    const workout = data.workout as Record<string, unknown>;
    expect(workout).toBeDefined();
    expect(workout.name).toBe("Gym Session");
    const exercises = workout.exercises as Array<Record<string, unknown>>;
    expect(exercises).toHaveLength(2);
  });

  it("should return null for active session after ending", async () => {
    const res = await client.get("/api/gym-sessions");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe("Gym Session Edge Cases", () => {
  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should end previous active session when starting a new one", async () => {
    const first = await client.post("/api/gym-sessions");
    const firstId = (first.body.data as Record<string, unknown>)._id;

    const second = await client.post("/api/gym-sessions");
    const secondId = (second.body.data as Record<string, unknown>)._id;

    expect(firstId).not.toBe(secondId);

    const active = await client.get("/api/gym-sessions");
    expect((active.body.data as Record<string, unknown>)._id).toBe(secondId);

    // Cleanup
    await client.patch(`/api/gym-sessions/${secondId}`, { action: "end" });
  });

  it("should handle ending session with no exercises (no workout created)", async () => {
    const session = await client.post("/api/gym-sessions");
    const sessionId = (session.body.data as Record<string, unknown>)._id as string;

    const res = await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "end",
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.workout).toBeNull();
  });
});
