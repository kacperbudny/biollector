import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { UserCollectionRepository } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepository } from "@/data/repositories/user-wishlist.repository";
import { UserProfileService } from "@/domain/services/user-profile.service";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationSetRatingService,
  getIntegrationUserCollectionRepository,
  getIntegrationUserProfileService,
  getIntegrationUserWishlistRepository,
} from "@/tests/integration";

describe(UserProfileService.name, () => {
  let collectionRepository: UserCollectionRepository;
  let wishlistRepository: UserWishlistRepository;
  let userProfileService: UserProfileService;

  beforeAll(() => {
    collectionRepository = getIntegrationUserCollectionRepository();
    wishlistRepository = getIntegrationUserWishlistRepository();
    userProfileService = getIntegrationUserProfileService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${UserProfileService.prototype.getPublicProfileViewModel.name}`, () => {
    it("returns empty lists when the stubbed user has no sets", async () => {
      const vm = await userProfileService.getPublicProfileViewModel("user-123");

      expect(vm?.displayName).toBe("Test User");
      expect(vm?.collection.totalCount).toBe(0);
      expect(vm?.wishlist.totalCount).toBe(0);
    });

    it("returns collection and wishlist sets without personal ratings", async () => {
      await collectionRepository.insert("user-123", "8534");
      await wishlistRepository.setWishlist(
        "user-123",
        "1388",
        UserWishlistScale.HIGH,
      );
      await getIntegrationSetRatingService().setRating("user-123", "8534", 5);

      const vm = await userProfileService.getPublicProfileViewModel("user-123");

      expect(vm?.collection.sets.map((s) => s.catalogNumber)).toEqual(["8534"]);
      expect(vm?.wishlist.sets.map((s) => s.catalogNumber)).toEqual(["1388"]);

      const collected = vm?.collection.sets[0];
      expect(collected?.isInCollection).toBe(false);
      expect(collected?.userRating).toBeUndefined();
      expect(collected?.wishlistScale).toBeNull();
      expect(collected?.averageRating).toBe(5);

      expect(vm?.wishlist.sets[0]?.wishlistScale).toBe(UserWishlistScale.HIGH);
      expect(vm?.wishlist.sets[0]?.isInCollection).toBe(false);
      expect(vm?.wishlist.sets[0]?.userRating).toBeUndefined();
    });

    it("excludes not-interested wishlist entries", async () => {
      await wishlistRepository.setWishlist(
        "user-123",
        "8534",
        UserWishlistScale.NOT_INTERESTED,
      );
      await wishlistRepository.setWishlist(
        "user-123",
        "1388",
        UserWishlistScale.MEDIUM,
      );

      const vm = await userProfileService.getPublicProfileViewModel("user-123");

      expect(vm?.wishlist.sets.map((s) => s.catalogNumber)).toEqual(["1388"]);
    });

    it("returns null when the user repository finds no user", async () => {
      const service = getIntegrationUserProfileService({
        findById: async () => null,
      });

      await expect(
        service.getPublicProfileViewModel("missing-user"),
      ).resolves.toBeNull();
    });
  });
});
