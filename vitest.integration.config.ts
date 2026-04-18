import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "integration",
    environment: "node",
    include: ["**/*.integration.test.ts"],
    maxWorkers: 1,
    maxConcurrency: 1,
    globalSetup: ["./vitest.integration.global-setup.ts"],
  },
});
