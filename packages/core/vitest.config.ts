import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,mts}"],
    coverage: {
      provider: "v8",
      include: ["**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.spec.ts", "vitest.config.ts", "dist/**"],
    },
  },
  resolve: {
    alias: {
      "@aurora/shared": "../shared/src",
      "@aurora/database": "../database",
    },
  },
});
