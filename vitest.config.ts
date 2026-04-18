import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "vitest.unit.config.ts",
      "vitest.integration.config.ts",
      "vitest.ui.config.ts",
    ],
  },
});
