import type { Kysely } from "kysely";
import { db } from "@/data/db/config";
import type { DB } from "@/data/db/types";
import { UserWishlistScale } from "@/domain/user-wishlist";

export type GetWishlistStateOptions = {
  wishlistedOnly?: boolean;
};

export type UserWishlistRepositoryPort = {
  getWishlistState(
    userId: string,
    options?: GetWishlistStateOptions,
  ): Promise<Record<string, number>>;
  deleteFromWishlist(userId: string, setNumber: string): Promise<void>;
  setWishlist(
    userId: string,
    setNumber: string,
    scale: UserWishlistScale,
  ): Promise<void>;
};

export class UserWishlistRepository implements UserWishlistRepositoryPort {
  constructor(private readonly db: Kysely<DB>) {}

  async getWishlistState(
    userId: string,
    options?: GetWishlistStateOptions,
  ): Promise<Record<string, number>> {
    let query = this.db
      .selectFrom("user_wishlist")
      .select(["set_number", "scale"])
      .where("user_id", "=", userId);

    if (options?.wishlistedOnly) {
      query = query.where("scale", "=", UserWishlistScale.WISHLISTED);
    }

    const rows = await query.execute();
    return Object.fromEntries(rows.map((r) => [r.set_number, r.scale]));
  }

  async deleteFromWishlist(userId: string, setNumber: string): Promise<void> {
    await this.db
      .deleteFrom("user_wishlist")
      .where("user_id", "=", userId)
      .where("set_number", "=", setNumber)
      .execute();
  }

  async setWishlist(
    userId: string,
    setNumber: string,
    scale: UserWishlistScale,
  ): Promise<void> {
    await this.db
      .insertInto("user_wishlist")
      .values({ user_id: userId, set_number: setNumber, scale })
      .onConflict((oc) =>
        oc.columns(["user_id", "set_number"]).doUpdateSet({ scale }),
      )
      .execute();
  }
}

export const userWishlistRepository = new UserWishlistRepository(db);
