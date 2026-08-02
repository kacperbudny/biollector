import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { DB } from "@/data/db/types";

export type UserCollectionRepositoryPort = {
  insert(userId: string, setNumber: string): Promise<void>;
  deleteFromCollection(userId: string, setNumber: string): Promise<void>;
  getUserCollection(userId: string): Promise<Record<string, Date>>;
  getDistinctCollectionsCount(): Promise<number>;
  isInCollection(userId: string, setNumber: string): Promise<boolean>;
};

export class UserCollectionRepository implements UserCollectionRepositoryPort {
  constructor(private readonly db: Kysely<DB>) {}

  async insert(userId: string, setNumber: string): Promise<void> {
    await this.db
      .insertInto("user_collection")
      .values({ user_id: userId, set_number: setNumber })
      .execute();
  }

  async deleteFromCollection(userId: string, setNumber: string): Promise<void> {
    await this.db
      .deleteFrom("user_collection")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .execute();
  }

  async getUserCollection(userId: string): Promise<Record<string, Date>> {
    const rows = await this.db
      .selectFrom("user_collection")
      .select(["set_number", "created_at"])
      .where("user_id", "=", userId)
      .execute();
    const result: Record<string, Date> = {};
    for (const r of rows) {
      result[r.set_number] = r.created_at;
    }
    return result;
  }

  async getDistinctCollectionsCount(): Promise<number> {
    const row = await this.db
      .selectFrom("user_collection")
      .select(sql<number>`count(distinct user_id)::int`.as("total_count"))
      .executeTakeFirst();

    return row?.total_count ?? 0;
  }

  async isInCollection(userId: string, setNumber: string): Promise<boolean> {
    const row = await this.db
      .selectFrom("user_collection")
      .select("user_id")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .limit(1)
      .executeTakeFirst();
    return row !== undefined;
  }
}
