import path from "node:path";
import dotenv from "dotenv";
import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
  migrations: {
    migrationFolder: path.join(__dirname, "src/data/db/migrations"),
  },
});
