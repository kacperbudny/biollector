import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "all",
    environment: "node",
    globalSetup: ["./vitest.integration.global-setup.ts"],
  },
});
