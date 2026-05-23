import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";

describe("Habits CRUD", () => {
  let habitId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a habit", async () => {
    const res = await client.post("/api/habits", {
      name: "Morning Run",
      description: "Run 5km every morning",
      frequency: "daily",
      color: "#f43f5e",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.name).toBe("Morning Run");
    expect(data.frequency).toBe("daily");
    expect(data.color).toBe("#f43f5e");

    habitId = data._id as string;
  });

  it("should list habits including the created one", async () => {
    const res = await client.get("/api/habits");

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((h) => h._id === habitId);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Morning Run");
  });

  it("should reject habit with missing name", async () => {
    const res = await client.post("/api/habits", {
      frequency: "daily",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject habit with invalid color format", async () => {
    const res = await client.post("/api/habits", {
      name: "Bad Color",
      frequency: "daily",
      color: "red",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should update a habit", async () => {
    const res = await client.patch(`/api/habits/${habitId}`, {
      name: "Evening Run",
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.name).toBe("Evening Run");
  });

  it("should delete a habit", async () => {
    const res = await client.delete(`/api/habits/${habitId}`);
    expect(res.status).toBe(200);

    // Verify it's gone
    const listRes = await client.get("/api/habits");
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((h) => h._id === habitId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent habit", async () => {
    const res = await client.delete("/api/habits/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
