import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { UserCollectionRepository } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepository } from "@/data/repositories/user-wishlist.repository";
import type { SetRatingService } from "@/domain/services/set-rating.service";
import { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationSetRatingRepository,
  getIntegrationSetRatingService,
  getIntegrationUserCollectionRepository,
  getIntegrationUserWishlistRepository,
} from "@/tests/integration";

describe(`@Integration ${SetViewModelContextLoader.name}`, () => {
  let loader: SetViewModelContextLoader;
  let userCollectionRepository: UserCollectionRepository;
  let userWishlistRepository: UserWishlistRepository;
  let setRatingService: SetRatingService;

  beforeAll(() => {
    const setRatingRepository = getIntegrationSetRatingRepository();

    userCollectionRepository = getIntegrationUserCollectionRepository();
    userWishlistRepository = getIntegrationUserWishlistRepository();
    loader = new SetViewModelContextLoader(
      userCollectionRepository,
      setRatingRepository,
      userWishlistRepository,
    );
    setRatingService = getIntegrationSetRatingService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  it("returns empty user-specific fields when userId is omitted", async () => {
    const ctx = await loader.load();

    expect(ctx.collectionSetNumbers).toEqual([]);
    expect(ctx.userRatingsBySet).toEqual({});
    expect(ctx.userWishlistStateBySet).toEqual({});
    expect(ctx.averageRatingsBySet).toEqual({});
  });

  it("loads collection, user ratings, averages, and wishlist when userId is passed", async () => {
    const userId = "integration-loader-user";
    const setNumber = "8534";

    await userCollectionRepository.insert(userId, setNumber);
    await setRatingService.setRating(userId, setNumber, 5);
    await userWishlistRepository.setWishlist(
      userId,
      setNumber,
      UserWishlistScale.WISHLISTED,
    );

    const ctx = await loader.load({ userId });

    expect(ctx.collectionSetNumbers).toEqual([setNumber]);
    expect(ctx.userRatingsBySet).toEqual({ [setNumber]: 5 });
    expect(ctx.userWishlistStateBySet).toEqual({
      [setNumber]: UserWishlistScale.WISHLISTED,
    });
    expect(ctx.averageRatingsBySet).toEqual({ [setNumber]: 5 });
  });
});
