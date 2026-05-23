import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today } from "@tests/helpers/test-user";

describe("Habit Logs", () => {
  let habitId: string;

  beforeAll(async () => {
    await ensureAuthenticated();

    const res = await client.post("/api/habits", {
      name: "Log Test Habit",
      frequency: "daily",
      color: "#6366f1",
    });
    habitId = (res.body.data as Record<string, unknown>)._id as string;
  });

  afterAll(async () => {
    await client.delete(`/api/habits/${habitId}`);
  });

  it("should mark habit as completed for today", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
      completed: true,
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.completed).toBe(true);
    expect(data.date).toBe(today());
  });

  it("should toggle habit back to incomplete", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
      completed: false,
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.completed).toBe(false);
  });

  it("should mark completed again (upsert works)", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
      completed: true,
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.completed).toBe(true);
  });

  it("should log habit for a different date", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: dateStr,
      completed: true,
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.date).toBe(dateStr);
  });

  it("should reject log with invalid date format", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: "25-04-2026",
      completed: true,
    });

    expect(res.status).toBe(400);
  });

  it("should reject log with missing completed field", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
    });

    expect(res.status).toBe(400);
  });

  it("should include optional note in log", async () => {
    const res = await client.post(`/api/habits/${habitId}/log`, {
      date: today(),
      completed: true,
      note: "Felt great today!",
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.note).toBe("Felt great today!");
  });
});
