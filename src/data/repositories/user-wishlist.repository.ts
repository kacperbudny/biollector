import type { Kysely } from "kysely";
import { db } from "@/data/db/config";
import type { DB } from "@/data/db/types";

export type UserWishlistRepositoryPort = {
  insert(userId: string, setNumber: string): Promise<void>;
  deleteFromWishlist(userId: string, setNumber: string): Promise<void>;
  getUserWishlist(userId: string): Promise<string[]>;
  isOnWishlist(userId: string, setNumber: string): Promise<boolean>;
};

export class UserWishlistRepository implements UserWishlistRepositoryPort {
  constructor(private readonly db: Kysely<DB>) {}

  async insert(userId: string, setNumber: string): Promise<void> {
    await this.db
      .insertInto("user_wishlist")
      .values({ user_id: userId, set_number: setNumber })
      .execute();
  }

  async deleteFromWishlist(userId: string, setNumber: string): Promise<void> {
    await this.db
      .deleteFrom("user_wishlist")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .execute();
  }

  async getUserWishlist(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom("user_wishlist")
      .select("set_number")
      .where("user_id", "=", userId)
      .execute();
    return rows.map((r) => r.set_number);
  }

  async isOnWishlist(userId: string, setNumber: string): Promise<boolean> {
    const row = await this.db
      .selectFrom("user_wishlist")
      .select("user_id")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .executeTakeFirst();

    return Boolean(row);
  }
}

export const userWishlistRepository = new UserWishlistRepository(db);
