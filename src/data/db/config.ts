import { neon } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import { config } from "@/config";
import type { DB } from "@/data/db/types";

export const db = new Kysely<DB>({
  dialect: new NeonDialect({
    neon: neon(config.DATABASE_URL),
  }),
});
