import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@tests/helpers/api-client";
import { createTestUser } from "@tests/helpers/test-user";

describe("Login & Session", () => {
  const client = new ApiClient();
  const user = createTestUser();

  beforeAll(async () => {
    await client.register(user);
  });

  it("should login with correct credentials", async () => {
    await client.login(user.email, user.password);
    expect(client.isAuthenticated).toBe(true);
  });

  it("should access protected API after login", async () => {
    const res = await client.get("/api/habits");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject requests without session", async () => {
    const res = await client.withoutAuth(() => client.get("/api/habits"));
    expect(res.status).toBe(401);
  });

  it("should fail login with wrong password", async () => {
    const badClient = new ApiClient();
    await expect(
      badClient.login(user.email, "WrongPassword999")
    ).rejects.toThrow("Login failed");
  });

  it("should fail login with non-existent email", async () => {
    const badClient = new ApiClient();
    await expect(
      badClient.login("nobody@nowhere.com", "TestPass123")
    ).rejects.toThrow("Login failed");
  });
});
