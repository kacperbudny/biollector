import { neon } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import type { DB } from "kysely-codegen";
import { NeonDialect } from "kysely-neon";

const dialect = new NeonDialect({
  neon: neon(process.env.DATABASE_URL!), // TODO
});

export const db = new Kysely<DB>({
  dialect,
});
