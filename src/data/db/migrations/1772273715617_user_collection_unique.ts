import type { Kysely } from "kysely";

const constraintName = "user_collection_user_id_set_number_unique";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("user_collection")
    .addUniqueConstraint(constraintName, ["user_id", "set_number"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("user_collection")
    .dropConstraint(constraintName)
    .execute();
}
