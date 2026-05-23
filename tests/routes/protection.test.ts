import { describe, it, expect } from "vitest";
import { ApiClient } from "@tests/helpers/api-client";

describe("Route Protection — Unauthenticated API Access", () => {
  const client = new ApiClient(); // No login

  it("GET /api/habits should return 401", async () => {
    const res = await client.get("/api/habits");
    expect(res.status).toBe(401);
  });

  it("GET /api/dashboard should return 401", async () => {
    const res = await client.get("/api/dashboard");
    expect(res.status).toBe(401);
  });

  it("GET /api/workouts should return 401", async () => {
    const res = await client.get("/api/workouts");
    expect(res.status).toBe(401);
  });

  it("GET /api/gym-sessions should return 401", async () => {
    const res = await client.get("/api/gym-sessions");
    expect(res.status).toBe(401);
  });

  it("POST /api/habits should return 401", async () => {
    const res = await client.post("/api/habits", { name: "hack", frequency: "daily" });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/food-logs/fakeid should return 401", async () => {
    const res = await client.patch("/api/food-logs/000000000000000000000001", { calories: 100 });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/expenses/fakeid should return 401", async () => {
    const res = await client.patch("/api/expenses/000000000000000000000001", { amount: 50 });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/body-care/fakeid should return 401", async () => {
    const res = await client.patch("/api/body-care/000000000000000000000001", { title: "test" });
    expect(res.status).toBe(401);
  });
});

describe("Route Protection — Page Redirects", () => {
  const client = new ApiClient(); // No login

  it("GET / should NOT redirect (public landing page)", async () => {
    const res = await client.raw("/");
    expect(res.status).toBe(200);
  });

  it("GET /home should redirect to /login", async () => {
    const res = await client.raw("/home");
    expect([307, 308]).toContain(res.status);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("GET /habits should redirect to /login", async () => {
    const res = await client.raw("/habits");
    expect([307, 308]).toContain(res.status);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("GET /gym should redirect to /login", async () => {
    const res = await client.raw("/gym");
    expect([307, 308]).toContain(res.status);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("GET /login should NOT redirect (public route)", async () => {
    const res = await client.raw("/login");
    expect(res.status).toBe(200);
  });

  it("GET /register should NOT redirect (public route)", async () => {
    const res = await client.raw("/register");
    expect(res.status).toBe(200);
  });
});
