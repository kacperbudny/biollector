import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { UserWishlistRepository } from "@/data/repositories/user-wishlist.repository";
import { UserWishlistService } from "@/domain/services/user-wishlist.service";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationUserWishlistRepository,
  getIntegrationUserWishlistService,
} from "@/tests/integration";

describe(`@Integration ${UserWishlistService.name}`, () => {
  let wishlistRepository: UserWishlistRepository;
  let wishlistService: UserWishlistService;

  beforeAll(() => {
    wishlistRepository = getIntegrationUserWishlistRepository();
    wishlistService = getIntegrationUserWishlistService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${UserWishlistService.prototype.setWishlist.name}`, () => {
    it("sets wishlisted set", async () => {
      await wishlistService.setWishlist(
        "user-123",
        "8534",
        UserWishlistScale.WISHLISTED,
      );
      const state = await wishlistRepository.getWishlistState("user-123");
      expect(state["8534"]).toBe(UserWishlistScale.WISHLISTED);
    });

    it("removes wishlisted set", async () => {
      await wishlistService.setWishlist(
        "user-123",
        "8534",
        UserWishlistScale.WISHLISTED,
      );
      await wishlistService.setWishlist("user-123", "8534", null);
      const state = await wishlistRepository.getWishlistState("user-123");
      expect(state["8534"]).toBeUndefined();
    });

    describe(`${UserWishlistService.prototype.getWishlistViewModel.name}`, () => {
      it("returns wishlisted sets for the user", async () => {
        await wishlistService.setWishlist(
          "user-123",
          "8534",
          UserWishlistScale.WISHLISTED,
        );
        const vm = await wishlistService.getWishlistViewModel("user-123");
        const catalogNumbers = vm.data.flatMap((y) =>
          y.waves.flatMap((w) => w.sets.map((s) => s.catalogNumber)),
        );
        expect(catalogNumbers).toContain("8534");
      });
    });
  });
});
