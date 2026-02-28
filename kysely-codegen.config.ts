import path from "node:path";
import { defineConfig } from "kysely-codegen";

export default defineConfig({
	dialect: "postgres",
	outFile: path.join(__dirname, "src/data/db/types.ts"),
	envFile: ".env.local",
});
