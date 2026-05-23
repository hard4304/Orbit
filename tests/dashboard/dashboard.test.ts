import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today } from "@tests/helpers/test-user";

describe("Dashboard API", () => {
  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should return dashboard stats", async () => {
    const res = await client.get("/api/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data).toHaveProperty("habitsToday");
    expect(data).toHaveProperty("gymThisWeek");
    expect(data).toHaveProperty("activeStreak");
    expect(typeof data.habitsToday).toBe("string");
    expect(typeof data.gymThisWeek).toBe("number");
    expect(typeof data.activeStreak).toBe("number");
  });

  it("should show 0/0 when no habits exist", async () => {
    // First clean up any leftover habits
    const listRes = await client.get("/api/habits");
    const habits = listRes.body.data as Array<Record<string, unknown>>;
    for (const h of habits) {
      await client.delete(`/api/habits/${h._id}`);
    }

    const res = await client.get("/api/dashboard");
    const data = res.body.data as Record<string, unknown>;
    expect(data.habitsToday).toBe("0/0");
  });

  it("should reflect habit creation and completion", async () => {
    // Create a habit
    const createRes = await client.post("/api/habits", {
      name: "Dashboard Habit",
      frequency: "daily",
      color: "#10b981",
    });
    const habitId = (createRes.body.data as Record<string, unknown>)._id as string;

    // Dashboard should show 0/1
    const res1 = await client.get("/api/dashboard");
    expect((res1.body.data as Record<string, unknown>).habitsToday).toBe("0/1");

    // Complete the habit
    await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
      completed: true,
    });

    // Dashboard should show 1/1
    const res2 = await client.get("/api/dashboard");
    expect((res2.body.data as Record<string, unknown>).habitsToday).toBe("1/1");

    // Delete the habit
    await client.delete(`/api/habits/${habitId}`);

    // Dashboard should show 0/0 (not 1/0)
    const res3 = await client.get("/api/dashboard");
    expect((res3.body.data as Record<string, unknown>).habitsToday).toBe("0/0");
  });

  it("should count gym sessions for this week", async () => {
    // Start and end a session
    const sessionRes = await client.post("/api/gym-sessions");
    const sessionId = (sessionRes.body.data as Record<string, unknown>)._id as string;

    await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-exercise",
      data: { name: "Squat", muscleGroup: "legs" },
    });
    await client.patch(`/api/gym-sessions/${sessionId}`, {
      action: "add-set",
      data: { exerciseIndex: 0, weight: 100, reps: 5 },
    });
    await client.patch(`/api/gym-sessions/${sessionId}`, { action: "end" });

    const res = await client.get("/api/dashboard");
    const data = res.body.data as Record<string, unknown>;
    expect(data.gymThisWeek).toBeGreaterThanOrEqual(1);
  });
});
