import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today, daysAgo } from "@tests/helpers/test-user";

describe("Food Logs CRUD", () => {
  let logId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create a food log", async () => {
    const res = await client.post("/api/food-logs", {
      date: today(),
      mealType: "lunch",
      foodName: "Chicken Biryani",
      quantity: 1,
      servingSize: 200,
      calories: 450,
      protein: 25,
      carbs: 55,
      fat: 12,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.foodName).toBe("Chicken Biryani");
    expect(data.mealType).toBe("lunch");
    expect(data.calories).toBe(450);
    expect(data.protein).toBe(25);
    expect(data.quantity).toBe(1);

    logId = data._id as string;
  });

  it("should create a food log with quantity > 1", async () => {
    const res = await client.post("/api/food-logs", {
      date: today(),
      mealType: "snack",
      foodName: "Banana",
      quantity: 2,
      servingSize: 120,
      calories: 200,
      protein: 2.6,
    });

    expect(res.status).toBe(201);
    const data = res.body.data as Record<string, unknown>;
    expect(data.quantity).toBe(2);
    expect(data.calories).toBe(200);

    // Cleanup
    await client.delete(`/api/food-logs/${data._id}`);
  });

  it("should fetch food logs by date", async () => {
    const res = await client.get(`/api/food-logs?date=${today()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeDefined();
    expect(found?.foodName).toBe("Chicken Biryani");
  });

  it("should fetch food logs by date range", async () => {
    const res = await client.get(
      `/api/food-logs?startDate=${daysAgo(7)}&endDate=${today()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeDefined();
  });

  it("should require date or date range parameters", async () => {
    const res = await client.get("/api/food-logs");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject food log with missing required fields", async () => {
    const res = await client.post("/api/food-logs", {
      date: today(),
      mealType: "lunch",
      // missing foodName, calories
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject food log with invalid meal type", async () => {
    const res = await client.post("/api/food-logs", {
      date: today(),
      mealType: "brunch",
      foodName: "Toast",
      calories: 100,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject food log with negative calories", async () => {
    const res = await client.post("/api/food-logs", {
      date: today(),
      mealType: "lunch",
      foodName: "Magic food",
      calories: -100,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject food log with invalid date format", async () => {
    const res = await client.post("/api/food-logs", {
      date: "25/04/2026",
      mealType: "dinner",
      foodName: "Rice",
      calories: 200,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should delete a food log", async () => {
    const res = await client.delete(`/api/food-logs/${logId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const listRes = await client.get(`/api/food-logs?date=${today()}`);
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((l) => l._id === logId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent food log", async () => {
    const res = await client.delete("/api/food-logs/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("Food Logs - Auth protection", () => {
  it("should reject unauthenticated requests", async () => {
    const res = await client.withoutAuth(() =>
      client.get(`/api/food-logs?date=${today()}`)
    );

    // Should redirect or return 401
    expect([401, 302].includes(res.status) || res.body.success === false).toBe(
      true
    );
  });
});
