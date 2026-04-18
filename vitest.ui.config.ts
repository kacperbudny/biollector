import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: { label: "ui", color: "blue" },
    environment: "jsdom",
    include: ["**/*.ui.test.tsx"],
    setupFiles: ["./src/tests/vitest-rtl-setup.ts"],
  },
});
