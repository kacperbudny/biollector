import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "unit",
    environment: "node",
    include: ["**/*.unit.test.ts"],
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
  },
});
