import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";

describe("Reports CRUD", () => {
  let reportId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a bug report", async () => {
    const res = await client.post("/api/reports", {
      type: "bug",
      title: "Login button not working",
      description: "Clicking the login button does nothing on Safari",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.title).toBe("Login button not working");
    expect(data.type).toBe("bug");
    expect(data.status).toBe("open");

    reportId = data._id as string;
  });

  it("should create a feature request", async () => {
    const res = await client.post("/api/reports", {
      type: "feature",
      title: "Add dark mode",
      description: "Would love a dark mode toggle in settings",
    });

    expect(res.status).toBe(201);
    const data = res.body.data as Record<string, unknown>;
    expect(data.type).toBe("feature");
  });

  it("should fetch user reports", async () => {
    const res = await client.get("/api/reports");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    expect(data.length).toBeGreaterThanOrEqual(2);
    const found = data.find((r) => r._id === reportId);
    expect(found).toBeDefined();
  });

  it("should reject report with missing title", async () => {
    const res = await client.post("/api/reports", {
      type: "bug",
      description: "Missing title",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject report with invalid type", async () => {
    const res = await client.post("/api/reports", {
      type: "suggestion",
      title: "Bad type",
      description: "This should fail",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 403 for non-admin accessing admin reports", async () => {
    const res = await client.get("/api/admin/reports");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("should delete a report", async () => {
    const res = await client.delete(`/api/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const listRes = await client.get("/api/reports");
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((r) => r._id === reportId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent report", async () => {
    const res = await client.delete("/api/reports/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
