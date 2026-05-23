import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    include: [
      "tests/auth/**/*.test.ts",
      "tests/habits/**/*.test.ts",
      "tests/gym/**/*.test.ts",
      "tests/dashboard/**/*.test.ts",
      "tests/routes/**/*.test.ts",
      "tests/body-care/**/*.test.ts",
      "tests/reports/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@tests": path.resolve(__dirname, "tests"),
    },
  },
});
