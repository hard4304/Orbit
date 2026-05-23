import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today, daysAgo } from "@tests/helpers/test-user";

describe("Body Care Logs CRUD", () => {
  let logId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a body care log", async () => {
    const res = await client.post("/api/body-care", {
      date: today(),
      type: "skincare",
      title: "Morning routine",
      notes: "Applied sunscreen after moisturizer",
      products: ["CeraVe cleanser", "Niacinamide serum", "SPF 50"],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.title).toBe("Morning routine");
    expect(data.type).toBe("skincare");
    expect(data.products).toEqual(["CeraVe cleanser", "Niacinamide serum", "SPF 50"]);

    logId = data._id as string;
  });

  it("should fetch logs by date", async () => {
    const res = await client.get(`/api/body-care?date=${today()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Morning routine");
  });

  it("should fetch logs by date range", async () => {
    const res = await client.get(
      `/api/body-care?startDate=${daysAgo(7)}&endDate=${today()}`
    );

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeDefined();
  });

  it("should fetch logs by type", async () => {
    const res = await client.get("/api/body-care?type=skincare");

    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeDefined();
  });

  it("should require query parameters", async () => {
    const res = await client.get("/api/body-care");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject log with missing title", async () => {
    const res = await client.post("/api/body-care", {
      date: today(),
      type: "skincare",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject log with invalid type", async () => {
    const res = await client.post("/api/body-care", {
      date: today(),
      type: "dental",
      title: "Bad Type",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should delete a body care log", async () => {
    const res = await client.delete(`/api/body-care/${logId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const listRes = await client.get(`/api/body-care?date=${today()}`);
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent log", async () => {
    const res = await client.delete("/api/body-care/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
