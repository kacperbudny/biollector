import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "integration",
    environment: "node",
    globalSetup: ["./vitest.integration.global-setup.ts"],
    // @ts-expect-error Vitest ProjectConfig typings omit testNamePattern; it is applied at runtime.
    testNamePattern: /@Integration/,
  },
});
