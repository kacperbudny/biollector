import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { UserProfileService } from "@/domain/services/user-profile.service";
import { Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { FALLBACK_PROFILE_DISPLAY_NAME } from "@/domain/view-models/user-profile.view-model";
import { setFixture } from "@/tests/fixtures";
import { getUserCollectionMock, userProfileServiceMock } from "@/tests/unit";

describe(UserProfileService.name, () => {
  describe(`${UserProfileService.prototype.getPublicProfileViewModel.name}`, () => {
    it("returns null when the user repository finds no user", async () => {
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(
        service.getPublicProfileViewModel("missing-user"),
      ).resolves.toBeNull();
    });

    it("returns empty lists and fallback display name when the user has no sets", async () => {
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: null }),
        },
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.displayName).toBe(FALLBACK_PROFILE_DISPLAY_NAME);
      expect(result?.collection).toEqual({ sets: [], totalCount: 0 });
      expect(result?.wishlist).toEqual({ sets: [], totalCount: 0 });
    });

    it("trims a blank display name to the fallback", async () => {
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: "   " }),
        },
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.displayName).toBe(FALLBACK_PROFILE_DISPLAY_NAME);
    });

    it("returns collection sets without personal state", async () => {
      const sets = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const getUserRatings = vi.fn();
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: "Ada" }),
        },
        userCollection: {
          getUserCollection: getUserCollectionMock(["1", "2"]),
        },
        setRating: {
          getUserRatings,
          getAverageRatings: vi.fn().mockResolvedValue({ "1": 4.5 }),
        },
        setsRepository: new SetsRepository(sets),
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.displayName).toBe("Ada");
      expect(result?.collection.totalCount).toBe(2);
      expect(result?.collection.sets.map((s) => s.catalogNumber)).toEqual([
        "1",
        "2",
      ]);
      expect(result?.wishlist.totalCount).toBe(0);

      const tahu = result?.collection.sets.find((s) => s.catalogNumber === "1");
      expect(tahu?.isInCollection).toBe(false);
      expect(tahu?.wishlistScale).toBeNull();
      expect(tahu?.userRating).toBeUndefined();
      expect(tahu?.averageRating).toBe(4.5);
      expect(getUserRatings).not.toHaveBeenCalled();
    });

    it("returns wishlisted sets and excludes not-interested entries", async () => {
      const sets = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: "Ada" }),
        },
        wishlist: {
          getWishlistState: vi.fn().mockResolvedValue({
            "1": UserWishlistScale.MUST_HAVE,
            "2": UserWishlistScale.NOT_INTERESTED,
          }),
        },
        setsRepository: new SetsRepository(sets),
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.wishlist.sets.map((s) => s.catalogNumber)).toEqual(["1"]);
      expect(result?.wishlist.sets[0]?.wishlistScale).toBeNull();
      expect(result?.wishlist.sets[0]?.isInCollection).toBe(false);
      expect(result?.collection.totalCount).toBe(0);
    });

    it("returns both collection and wishlist when the user has both", async () => {
      const sets = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: "Ada" }),
        },
        userCollection: {
          getUserCollection: getUserCollectionMock(["1"]),
        },
        wishlist: {
          getWishlistState: vi.fn().mockResolvedValue({
            "2": UserWishlistScale.HIGH,
          }),
        },
        setsRepository: new SetsRepository(sets),
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.collection.sets.map((s) => s.catalogNumber)).toEqual([
        "1",
      ]);
      expect(result?.wishlist.sets.map((s) => s.catalogNumber)).toEqual(["2"]);
    });

    it("excludes set numbers that are not in the catalog", async () => {
      const sets = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = userProfileServiceMock({
        userRepository: {
          findById: vi.fn().mockResolvedValue({ displayName: "Ada" }),
        },
        userCollection: {
          getUserCollection: getUserCollectionMock(["1", "999"]),
        },
        setsRepository: new SetsRepository(sets),
      });

      const result = await service.getPublicProfileViewModel("user-123");

      expect(result?.collection.sets.map((s) => s.catalogNumber)).toEqual([
        "1",
      ]);
      expect(result?.collection.totalCount).toBe(1);
    });
  });
});
