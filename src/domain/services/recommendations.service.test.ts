import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { RecommendationsService } from "@/domain/services/recommendations.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { truncateTestDb } from "@/tests/db";
import { setFixture } from "@/tests/fixtures";
import { getIntegrationRecommendationsService } from "@/tests/integration";
import {
  recommendationsServiceMock,
  setRatingRepositoryMock,
  userCollectionRepositoryMock,
  userWishlistRepositoryMock,
} from "@/tests/unit";

describe(`@Unit ${RecommendationsService.name}`, () => {
  describe(`${RecommendationsService.prototype.getRecommendations.name}`, () => {
    it("ignores sets already owned or marked as not interested", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "100",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "101",
          name: "Not Interested",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "102",
          name: "Candidate",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["100"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "101": UserWishlistScale.NOT_INTERESTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result.map((item) => item.set.catalogNumber)).toEqual(["102"]);
    });

    it("prioritizes wishlisted sets over non-wishlisted sets", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "200",
          name: "Owned Inika",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "201",
          name: "Wishlisted",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "202",
          name: "Non Wishlisted",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["200"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "201": UserWishlistScale.WISHLISTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result[0]?.set.catalogNumber).toBe("201");
      expect(result[0]?.reasons).toContain("On your wishlist");
    });

    it("prefers one-left wave completion over two-left", async () => {
      const sets: BionicleSet[] = [
        // wave A -> one missing candidate
        setFixture({
          catalogNumber: "300",
          name: "Owned A",
          releaseYear: "2001",
          wave: Wave.TOHUNGA,
        }),
        setFixture({
          catalogNumber: "301",
          name: "Candidate A",
          releaseYear: "2001",
          wave: Wave.TOHUNGA,
        }),
        // wave B -> two missing candidates
        setFixture({
          catalogNumber: "310",
          name: "Owned B",
          releaseYear: "2002",
          wave: Wave.BOHROK,
        }),
        setFixture({
          catalogNumber: "311",
          name: "Candidate B1",
          releaseYear: "2002",
          wave: Wave.BOHROK,
        }),
        setFixture({
          catalogNumber: "312",
          name: "Candidate B2",
          releaseYear: "2002",
          wave: Wave.BOHROK,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["300", "310"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "301": UserWishlistScale.WISHLISTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result[0]?.set.catalogNumber).toBe("301");
      expect(result[0]?.reasons.join(" ")).toContain("Only 1 set left");
    });

    it("does not apply completion score for waves and years with zero owned sets", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "400",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "401",
          name: "New Scope Candidate",
          releaseYear: "2015",
          wave: Wave.TOA_MASTERS,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["400"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "401": UserWishlistScale.WISHLISTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");
      const candidate = result.find((item) => item.set.catalogNumber === "401");

      expect(candidate).toBeDefined();
      expect(candidate?.reasons.some((reason) => reason.includes("Only"))).toBe(
        false,
      );
      expect(
        candidate?.reasons.some((reason) => reason.includes("Check out 2015")),
      ).toBe(true);
      expect(
        candidate?.reasons.some((reason) =>
          reason.includes("Check out Toa Masters"),
        ),
      ).toBe(true);
    });

    it("gives stronger priority to year completion than wave completion", async () => {
      const sets: BionicleSet[] = [
        // target year completion candidate (2001 has 2 total, 1 owned)
        setFixture({
          catalogNumber: "500",
          name: "Owned Year",
          releaseYear: "2001",
          wave: Wave.TURAGA,
        }),
        setFixture({
          catalogNumber: "501",
          name: "Year Candidate",
          releaseYear: "2001",
          wave: Wave.RAHI,
        }),
        // target wave completion candidate (Toa Nuva has 2 total, 1 owned)
        setFixture({
          catalogNumber: "510",
          name: "Owned Wave",
          releaseYear: "2002",
          wave: Wave.TOA_NUVA,
        }),
        setFixture({
          catalogNumber: "511",
          name: "Wave Candidate",
          releaseYear: "2003",
          wave: Wave.TOA_NUVA,
        }),
        // filler so year completion for 2002/2003 is weaker than one-left
        setFixture({
          catalogNumber: "512",
          name: "Filler 2002",
          releaseYear: "2002",
          wave: Wave.BOHROK,
        }),
        setFixture({
          catalogNumber: "513",
          name: "Filler 2003",
          releaseYear: "2003",
          wave: Wave.RAHKSHI,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["500", "510"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "501": UserWishlistScale.WISHLISTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result[0]?.set.catalogNumber).toBe("501");
      expect(result[0]?.reasons.join(" ")).toContain("complete 2001");
    });

    it("includes weak average rating contribution", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "600",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.PIRAKA,
        }),
        setFixture({
          catalogNumber: "601",
          name: "Higher Rated",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "602",
          name: "Lower Rated",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["600"]),
        }),
        setRatingRepository: setRatingRepositoryMock({
          getAverageRatings: vi.fn().mockResolvedValue({
            "601": 4.8,
            "602": 2.1,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result[0]?.set.catalogNumber).toBe("601");
      expect(
        result[0]?.reasons.some((reason) =>
          reason.includes("Community rating"),
        ),
      ).toBe(true);
    });

    describe("average rating scoring", () => {
      it("ranks higher-rated set above lower-rated when only rating differs", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "610",
            name: "Owned",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
          setFixture({
            catalogNumber: "611",
            name: "Five Star",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
          setFixture({
            catalogNumber: "612",
            name: "One Star",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["610"]),
          }),
          setRatingRepository: setRatingRepositoryMock({
            getAverageRatings: vi.fn().mockResolvedValue({
              "611": 5,
              "612": 1,
            }),
          }),
        });

        const result = await service.getRecommendations("user-1", 10);

        expect(result[0]?.set.catalogNumber).toBe("611");
        expect(result[1]?.set.catalogNumber).toBe("612");
        // Contribution (rating - 3) * 20: 5 → +40, 1 → -40; difference 80
        expect((result[0]?.score ?? 0) - (result[1]?.score ?? 0)).toBe(80);
      });

      it("adds Community rating reason only when rating is above 3", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "620",
            name: "Owned",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
          setFixture({
            catalogNumber: "621",
            name: "Above Neutral",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
          setFixture({
            catalogNumber: "622",
            name: "Below Neutral",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["620"]),
          }),
          setRatingRepository: setRatingRepositoryMock({
            getAverageRatings: vi.fn().mockResolvedValue({
              "621": 4,
              "622": 2,
            }),
          }),
        });

        const result = await service.getRecommendations("user-1");

        const aboveNeutral = result.find((r) => r.set.catalogNumber === "621");
        const belowNeutral = result.find((r) => r.set.catalogNumber === "622");

        expect(
          aboveNeutral?.reasons.some((r) => r.includes("Community rating")),
        ).toBe(true);
        expect(
          belowNeutral?.reasons.some((r) => r.includes("Community rating")),
        ).toBe(false);
      });

      it("penalizes sets with rating below 3 so they rank after above-3 sets", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "630",
            name: "Owned",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
          setFixture({
            catalogNumber: "631",
            name: "Low Rated",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
          setFixture({
            catalogNumber: "632",
            name: "High Rated",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["630"]),
          }),
          setRatingRepository: setRatingRepositoryMock({
            getAverageRatings: vi.fn().mockResolvedValue({
              "631": 1.5,
              "632": 4.5,
            }),
          }),
        });

        const result = await service.getRecommendations("user-1");

        expect(result[0]?.set.catalogNumber).toBe("632");
        expect(result[1]?.set.catalogNumber).toBe("631");
      });

      it("gives neutral contribution at rating 3 (no reason, same base score as unrated)", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "640",
            name: "Owned",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
          setFixture({
            catalogNumber: "641",
            name: "Rated 3",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
          setFixture({
            catalogNumber: "642",
            name: "No Rating",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["640"]),
          }),
          setRatingRepository: setRatingRepositoryMock({
            getAverageRatings: vi.fn().mockResolvedValue({
              "641": 3,
            }),
          }),
        });

        const result = await service.getRecommendations("user-1");

        const ratedThree = result.find((r) => r.set.catalogNumber === "641");
        const noRating = result.find((r) => r.set.catalogNumber === "642");

        expect(
          ratedThree?.reasons.some((r) => r.includes("Community rating")),
        ).toBe(false);
        expect(ratedThree?.score).toBe(noRating?.score);
      });
    });

    it("stacks criteria so wishlist plus completion outranks wishlist alone", async () => {
      const sets: BionicleSet[] = [
        // wishlisted + completion
        setFixture({
          catalogNumber: "700",
          name: "Owned In Wave",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "701",
          name: "Wishlist + Completion",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        // wishlist only (new year and wave with no owned -> discovery only)
        setFixture({
          catalogNumber: "702",
          name: "Wishlist Only",
          releaseYear: "2015",
          wave: Wave.TOA_MASTERS,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["700"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "701": UserWishlistScale.WISHLISTED,
            "702": UserWishlistScale.WISHLISTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result[0]?.set.catalogNumber).toBe("701");
      expect(result[0]?.reasons).toContain("On your wishlist");
      expect(
        result[0]?.reasons.some((reason) => reason.includes("Only 1 set")),
      ).toBe(true);
    });

    it("sorts by score descending and respects requested limit", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "800",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        ...Array.from({ length: 12 }, (_, i) =>
          setFixture({
            catalogNumber: `${810 + i}`,
            name: `Candidate ${i + 1}`,
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["800"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "810": UserWishlistScale.WISHLISTED,
            "811": UserWishlistScale.WISHLISTED,
            "812": UserWishlistScale.WISHLISTED,
            "813": UserWishlistScale.WISHLISTED,
            "814": UserWishlistScale.WISHLISTED,
          }),
        }),
        setRatingRepository: setRatingRepositoryMock({
          getAverageRatings: vi.fn().mockResolvedValue({
            "810": 4.9,
            "811": 4.8,
            "812": 4.7,
            "813": 4.6,
            "814": 4.5,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1", 10);

      expect(result).toHaveLength(10);
      const scores = result.map((item) => item.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });

    it("returns an empty array when there are no recommendation candidates", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "900",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "901",
          name: "Not Interested",
          releaseYear: "2006",
          wave: Wave.PIRAKA,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["900"]),
        }),
        userWishlistRepository: userWishlistRepositoryMock({
          getWishlistState: vi.fn().mockResolvedValue({
            "901": UserWishlistScale.NOT_INTERESTED,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result).toEqual([]);
    });

    it("returns one recommendation with reasons when only one candidate exists", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "950",
          name: "Owned",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "951",
          name: "Single Candidate",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["950"]),
        }),
        setRatingRepository: setRatingRepositoryMock({
          getAverageRatings: vi.fn().mockResolvedValue({
            "951": 4.2,
          }),
        }),
      });

      const result = await service.getRecommendations("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]?.set.catalogNumber).toBe("951");
      expect(result[0]?.reasons.length).toBeGreaterThan(0);
    });
  });
});

describe(`@Integration ${RecommendationsService.name}`, () => {
  let recommendationsService: RecommendationsService;

  beforeAll(() => {
    recommendationsService = getIntegrationRecommendationsService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${RecommendationsService.prototype.getRecommendations.name}`, () => {
    it("returns a non-empty ranked list for a new user", async () => {
      const limit = 20;
      const result = await recommendationsService.getRecommendations(
        "new-user-999",
        limit,
      );
      expect(result.length).toEqual(limit);
      expect(result[0]).toMatchObject({
        score: expect.any(Number),
        reasons: expect.any(Array),
      });
    });
  });
});
