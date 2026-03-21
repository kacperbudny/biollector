import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";
import { migrateTestDb } from "./src/tests/db";

const POSTGRES_IMAGE = "postgres:18-alpine";

export default async function vitestIntegrationGlobalSetup(
  project: TestProject,
) {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const uri = container.getConnectionUri();

  await migrateTestDb(uri);

  project.provide("integrationDatabaseUrl", uri);

  return async () => {
    await container.stop();
  };
}
