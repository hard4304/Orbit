import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today } from "@tests/helpers/test-user";

describe("Workouts CRUD", () => {
  let workoutId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a workout manually", async () => {
    const res = await client.post("/api/workouts", {
      date: today(),
      name: "Push Day",
      exercises: [
        {
          name: "Bench Press",
          muscleGroup: "chest",
          sets: [
            { setNumber: 1, weight: 80, reps: 8 },
            { setNumber: 2, weight: 85, reps: 6 },
          ],
        },
      ],
      duration: 45,
      notes: "Felt strong today",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    workoutId = data._id as string;
    expect(data.name).toBe("Push Day");
  });

  it("should list workouts including the created one", async () => {
    const res = await client.get("/api/workouts");

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((w) => w._id === workoutId);
    expect(found).toBeDefined();
  });

  it("should reject workout with no exercises", async () => {
    const res = await client.post("/api/workouts", {
      date: today(),
      name: "Empty Day",
      exercises: [],
    });

    expect(res.status).toBe(400);
  });

  it("should reject workout with invalid muscle group", async () => {
    const res = await client.post("/api/workouts", {
      date: today(),
      name: "Bad Day",
      exercises: [
        {
          name: "Magic Exercise",
          muscleGroup: "wings",
          sets: [{ setNumber: 1, weight: 10, reps: 10 }],
        },
      ],
    });

    expect(res.status).toBe(400);
  });

  it("should delete a workout", async () => {
    const res = await client.delete(`/api/workouts/${workoutId}`);
    expect(res.status).toBe(200);

    const listRes = await client.get("/api/workouts");
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((w) => w._id === workoutId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent workout", async () => {
    const res = await client.delete("/api/workouts/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
