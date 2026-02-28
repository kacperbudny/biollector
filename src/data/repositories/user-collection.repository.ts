import type { Kysely } from "kysely";
import { db } from "@/data/db/config";
import type { DB } from "@/data/db/types";

export type UserCollectionRepositoryPort = {
  insert(userId: string, setNumber: string): Promise<void>;
  deleteByUserAndSet(userId: string, setNumber: string): Promise<void>;
  getSetNumbersByUserId(userId: string): Promise<string[]>;
};

export class UserCollectionRepository implements UserCollectionRepositoryPort {
  constructor(private readonly db: Kysely<DB>) {}

  async insert(userId: string, setNumber: string): Promise<void> {
    await this.db
      .insertInto("user_collection")
      .values({ user_id: userId, set_number: setNumber })
      .execute();
  }

  async deleteByUserAndSet(userId: string, setNumber: string): Promise<void> {
    await this.db
      .deleteFrom("user_collection")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .execute();
  }

  async getSetNumbersByUserId(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom("user_collection")
      .select("set_number")
      .where("user_id", "=", userId)
      .execute();
    return rows.map((r) => r.set_number);
  }
}

export const userCollectionRepository = new UserCollectionRepository(db);
