/**
 * Test user factory.
 * Generates unique test users for each test run to avoid collisions.
 */

const timestamp = Date.now();
let counter = 0;

export function createTestUser() {
  counter++;
  return {
    username: `testuser_${timestamp}_${counter}`,
    email: `testuser_${timestamp}_${counter}@test.com`,
    password: "TestPass123",
  };
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
