import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    testTimeout: 10_000,
    fileParallelism: false,
    env: {
      DATABASE_URL: "postgres://nexus:nexus_local@127.0.0.1:5432/nexus_test",
    },
  },
});
