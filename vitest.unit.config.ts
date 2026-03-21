import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: "unit",
    environment: "node",
    // @ts-expect-error ProjectConfig typings omit testNamePattern; Vitest applies it at runtime.
    testNamePattern: /@Unit/,
  },
});
