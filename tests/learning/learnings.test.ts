import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today, daysAgo } from "@tests/helpers/test-user";

describe("Learnings CRUD", () => {
  let learningId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a learning entry", async () => {
    const res = await client.post("/api/learnings", {
      date: today(),
      category: "dsa",
      title: "Binary Search on Rotated Array",
      content: "Learned how to find pivot point and apply binary search on each half.",
      tags: ["arrays", "binary-search"],
      durationMinutes: 45,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.title).toBe("Binary Search on Rotated Array");
    expect(data.category).toBe("dsa");
    expect(data.durationMinutes).toBe(45);
    expect(data.tags).toEqual(["arrays", "binary-search"]);

    learningId = data._id as string;
  });

  it("should fetch learnings by date", async () => {
    const res = await client.get(`/api/learnings?date=${today()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === learningId);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Binary Search on Rotated Array");
  });

  it("should fetch learnings by date range", async () => {
    const res = await client.get(
      `/api/learnings?startDate=${daysAgo(7)}&endDate=${today()}`
    );

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === learningId);
    expect(found).toBeDefined();
  });

  it("should fetch learnings by category", async () => {
    const res = await client.get("/api/learnings?category=dsa");

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === learningId);
    expect(found).toBeDefined();
  });

  it("should require query parameters", async () => {
    const res = await client.get("/api/learnings");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject learning with missing title", async () => {
    const res = await client.post("/api/learnings", {
      date: today(),
      category: "general",
      content: "Some notes",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject learning with invalid category", async () => {
    const res = await client.post("/api/learnings", {
      date: today(),
      category: "cooking",
      title: "Bad Category",
      content: "This should fail",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should update a learning entry", async () => {
    const res = await client.patch(`/api/learnings/${learningId}`, {
      title: "Binary Search Variants",
    });

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data.title).toBe("Binary Search Variants");
  });

  it("should delete a learning entry", async () => {
    const res = await client.delete(`/api/learnings/${learningId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const listRes = await client.get(`/api/learnings?date=${today()}`);
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === learningId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent learning", async () => {
    const res = await client.delete("/api/learnings/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
