import type { Kysely } from "kysely";
import { sql } from "kysely";
import { db } from "@/data/db/config";
import type { DB } from "@/data/db/types";
import type { SetRatingEntity } from "@/domain/set-rating.entity";

export type GetAverageRatingsOptions = {
  sortBy?: "rating";
  sortOrder?: "desc" | "asc";
  limit?: number;
};

export type SetRatingRepositoryPort = {
  getUserRatings(userId: string): Promise<Record<string, number>>;
  getAverageRatings(
    options?: GetAverageRatingsOptions,
  ): Promise<Record<string, number>>;
  getTotalRatingsCount(): Promise<number>;
  setRating(entity: SetRatingEntity): Promise<void>;
};

export class SetRatingRepository implements SetRatingRepositoryPort {
  constructor(private readonly db: Kysely<DB>) {}

  async getUserRatings(userId: string): Promise<Record<string, number>> {
    const rows = await this.db
      .selectFrom("user_rating")
      .select(["set_number", "rating"])
      .where("user_id", "=", userId)
      .execute();
    return Object.fromEntries(rows.map((r) => [r.set_number, r.rating]));
  }

  async getAverageRatings(
    options: GetAverageRatingsOptions = { sortOrder: "desc" },
  ): Promise<Record<string, number>> {
    let query = this.db
      .selectFrom("user_rating")
      .select([
        "set_number",
        sql<number>`round(avg(rating)::numeric, 1)`.as("avg_rating"),
      ])
      .groupBy("set_number");

    if (options.sortBy) {
      query = query.orderBy(
        sql`round(avg(rating)::numeric, 1)`,
        options.sortOrder,
      );
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const rows = await query.execute();
    return Object.fromEntries(
      rows.map((r) => [r.set_number, Number(r.avg_rating)]),
    );
  }

  async getTotalRatingsCount(): Promise<number> {
    const row = await this.db
      .selectFrom("user_rating")
      .select(sql<number>`count(*)::int`.as("total_count"))
      .executeTakeFirst();

    return row?.total_count ?? 0;
  }

  async setRating(entity: SetRatingEntity): Promise<void> {
    await this.db
      .insertInto("user_rating")
      .values({
        user_id: entity.userId,
        set_number: entity.setNumber,
        rating: entity.rating,
      })
      .onConflict((oc) =>
        oc.columns(["user_id", "set_number"]).doUpdateSet({
          rating: entity.rating,
          updated_at: sql`now()`,
        }),
      )
      .execute();
  }
}

export const setRatingRepository = new SetRatingRepository(db);
