/**
 * Global test setup.
 *
 * Creates a shared authenticated ApiClient that all tests can import.
 * The user is registered and logged in once before all tests run.
 */

import { ApiClient } from "./api-client";
import { createTestUser } from "./test-user";

export const client = new ApiClient();
export const testUser = createTestUser();

/**
 * Call this in a beforeAll() to ensure the client is authenticated.
 * Safe to call multiple times — only registers/logs in once.
 */
let initialized = false;

export async function ensureAuthenticated(): Promise<void> {
  if (initialized) return;

  await client.register(testUser);
  await client.login(testUser.email, testUser.password);

  if (!client.isAuthenticated) {
    throw new Error("Failed to authenticate test user");
  }

  initialized = true;
}
