import path from "node:path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { defineConfig } from "kysely-ctl";
import { NeonDialect } from "kysely-neon";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: new NeonDialect({
    neon: neon(process.env.DATABASE_URL as string),
  }),
  migrations: {
    migrationFolder: path.join(__dirname, "src/data/db/migrations"),
  },
});
