import { describe, it, expect, beforeAll } from "vitest";
import { client, ensureAuthenticated } from "@tests/helpers/setup";
import { today } from "@tests/helpers/test-user";

describe("Expenses CRUD", () => {
  let expenseId: string;

  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create an expense", async () => {
    const res = await client.post("/api/expenses", {
      amount: 250,
      category: "food",
      medium: "upi",
      date: today(),
      description: "Lunch at restaurant",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Record<string, unknown>;
    expect(data.amount).toBe(250);
    expect(data.category).toBe("food");
    expect(data.medium).toBe("upi");
    expect(data.description).toBe("Lunch at restaurant");

    expenseId = data._id as string;
  });

  it("should list expenses by date range", async () => {
    const res = await client.get(
      `/api/expenses?startDate=${today()}&endDate=${today()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data as Array<Record<string, unknown>>;
    const found = data.find((e) => e._id === expenseId);
    expect(found).toBeDefined();
    expect(found?.amount).toBe(250);
  });

  it("should require startDate and endDate", async () => {
    const res = await client.get("/api/expenses");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject expense with missing fields", async () => {
    const res = await client.post("/api/expenses", {
      amount: 100,
      // missing category, medium, date, description
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject expense with negative amount", async () => {
    const res = await client.post("/api/expenses", {
      amount: -50,
      category: "food",
      medium: "cash",
      date: today(),
      description: "Invalid expense",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject expense with invalid category", async () => {
    const res = await client.post("/api/expenses", {
      amount: 100,
      category: "invalid_category",
      medium: "cash",
      date: today(),
      description: "Bad category",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject expense with invalid date format", async () => {
    const res = await client.post("/api/expenses", {
      amount: 100,
      category: "food",
      medium: "upi",
      date: "25-04-2026",
      description: "Bad date",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should delete an expense", async () => {
    const res = await client.delete(`/api/expenses/${expenseId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const listRes = await client.get(
      `/api/expenses?startDate=${today()}&endDate=${today()}`
    );
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const found = data.find((e) => e._id === expenseId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting non-existent expense", async () => {
    const res = await client.delete("/api/expenses/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("Expenses - Multiple entries and date filtering", () => {
  beforeAll(async () => {
    await ensureAuthenticated();
  });

  it("should create multiple expenses and sum correctly", async () => {
    const expense1 = await client.post("/api/expenses", {
      amount: 100,
      category: "transport",
      medium: "upi",
      date: today(),
      description: "Auto fare",
    });
    const expense2 = await client.post("/api/expenses", {
      amount: 50,
      category: "food",
      medium: "cash",
      date: today(),
      description: "Tea and snacks",
    });

    expect(expense1.status).toBe(201);
    expect(expense2.status).toBe(201);

    const listRes = await client.get(
      `/api/expenses?startDate=${today()}&endDate=${today()}`
    );
    const data = listRes.body.data as Array<Record<string, unknown>>;
    const ids = [
      (expense1.body.data as Record<string, unknown>)._id,
      (expense2.body.data as Record<string, unknown>)._id,
    ];

    const created = data.filter((e) => ids.includes(e._id));
    expect(created.length).toBe(2);

    // Cleanup
    for (const id of ids) {
      await client.delete(`/api/expenses/${id}`);
    }
  });
});
