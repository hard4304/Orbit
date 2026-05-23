import { describe, it, expect } from "vitest";
import { ApiClient } from "@tests/helpers/api-client";
import { createTestUser } from "@tests/helpers/test-user";

describe("POST /api/auth/register", () => {
  const client = new ApiClient();

  it("should register a new user successfully", async () => {
    const user = createTestUser();
    const res = await client.register(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("username", user.username);
    expect(res.body.data).toHaveProperty("email", user.email);
  });

  it("should NOT return password in response", async () => {
    const user = createTestUser();
    const res = await client.register(user);

    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("should reject duplicate email", async () => {
    const user = createTestUser();
    await client.register(user);

    const res = await client.register(user);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("already");
  });

  it("should reject duplicate username with different email", async () => {
    const user = createTestUser();
    await client.register(user);

    const res = await client.register({
      ...user,
      email: `other_${Date.now()}@test.com`,
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should reject password shorter than 6 characters", async () => {
    const res = await client.register({
      username: `short_${Date.now()}`,
      email: `short_${Date.now()}@test.com`,
      password: "12",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid email format", async () => {
    const res = await client.register({
      username: `bad_${Date.now()}`,
      email: "not-an-email",
      password: "TestPass123",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject username with special characters", async () => {
    const res = await client.register({
      username: "bad user!@#",
      email: `special_${Date.now()}@test.com`,
      password: "TestPass123",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
