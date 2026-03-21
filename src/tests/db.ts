import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
  sql,
} from "kysely";
import { Pool } from "pg";
import { inject } from "vitest";
import type { DB } from "@/data/db/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let testDbInstance: Kysely<DB> | undefined;

function createTestDb(connectionString: string): Kysely<DB> {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });
}

export async function migrateTestDb(connectionString: string): Promise<void> {
  const runDb = createTestDb(connectionString);
  try {
    await migrateToLatest(runDb);
  } finally {
    await runDb.destroy();
  }
}

async function migrateToLatest(kysely: Kysely<DB>): Promise<void> {
  const migrator = new Migrator({
    db: kysely as unknown as Kysely<Record<string, unknown>>,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "../data/db/migrations"),
    }),
  });

  const { error } = await migrator.migrateToLatest();

  if (error) {
    throw error;
  }
}

export function getTestDb(): Kysely<DB> {
  if (!testDbInstance) {
    testDbInstance = createTestDb(inject("integrationDatabaseUrl"));
  }
  return testDbInstance;
}

export async function truncateTestDb(): Promise<void> {
  await sql`truncate table user_rating, user_collection, user_wishlist restart identity cascade`.execute(
    getTestDb(),
  );
}
