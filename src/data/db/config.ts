import { neon } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";

// import type { Database } from './types.ts';

const dialect = new NeonDialect({
  neon: neon(process.env.DATABASE_URL!), // TODO
});

export const db = new Kysely({
  dialect,
});
