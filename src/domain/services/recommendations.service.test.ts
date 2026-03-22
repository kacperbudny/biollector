import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { RecommendationsService } from "@/domain/services/recommendations.service";
import { BionicleCharacter, type BionicleSet, Wave } from "@/domain/sets";
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

    it("does not apply wave completion until user owns at least half of the wave", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "320",
          name: "Owned In Wave",
          releaseYear: "2003",
          wave: Wave.RAHKSHI,
        }),
        setFixture({
          catalogNumber: "321",
          name: "Candidate Wave Completion",
          releaseYear: "2003",
          wave: Wave.RAHKSHI,
        }),
        setFixture({
          catalogNumber: "322",
          name: "Third In Wave",
          releaseYear: "2003",
          wave: Wave.RAHKSHI,
        }),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["320"]),
        }),
      });

      const result = await service.getRecommendations("user-1");
      const candidate = result.find((item) => item.set.catalogNumber === "321");

      expect(
        candidate?.reasons.some((reason) => reason.includes("complete Rahkshi")),
      ).toBe(false);
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

    it("does not apply year completion when more than 10 sets are missing", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "520",
          name: "Owned 2006",
          releaseYear: "2006",
          wave: Wave.PIRAKA,
        }),
        ...Array.from({ length: 11 }, (_, index) =>
          setFixture({
            catalogNumber: `${521 + index}`,
            name: `Candidate ${index + 1}`,
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
        ),
      ];
      const service = recommendationsServiceMock({
        setsRepository: new SetsRepository(sets),
        userCollectionRepository: userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["520"]),
        }),
      });

      const result = await service.getRecommendations("user-1");
      const candidate = result.find((item) => item.set.catalogNumber === "521");

      expect(
        candidate?.reasons.some((reason) => reason.includes("complete 2006")),
      ).toBe(false);
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

    describe("character and generation scoring", () => {
      it("adds character completion for characters[] when user is nearing completion", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1000",
            name: "Owned Tahu A",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1001",
            name: "Owned Tahu B",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1002",
            name: "Candidate Tahu",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1003",
            name: "Non Character Candidate",
            releaseYear: "2014",
            wave: Wave.MISCELLANEOUS,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1000", "1001"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const tahuCandidate = result.find(
          (item) => item.set.catalogNumber === "1002",
        );
        const nonCharacterCandidate = result.find(
          (item) => item.set.catalogNumber === "1003",
        );

        expect(tahuCandidate).toBeDefined();
        expect(tahuCandidate?.reasons.join(" ")).toContain(
          "left to complete Tahu",
        );
        expect(
          nonCharacterCandidate?.reasons.some((reason) =>
            reason.includes("left to complete Tahu"),
          ),
        ).toBe(false);
        expect(tahuCandidate?.score).toBe(80);
        expect(nonCharacterCandidate?.score).toBe(0);
      });

      it("considers character completed when user owns a minifigure of particular variation", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1010",
            name: "Owned Hakann",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
            minifigures: [{ character: BionicleCharacter.HAKANN }],
          }),
          setFixture({
            catalogNumber: "1011",
            name: "Candidate Hakann",
            releaseYear: "2007",
            wave: Wave.BARRAKI,
            minifigures: [{ character: BionicleCharacter.HAKANN }],
          }),
          setFixture({
            catalogNumber: "1012",
            name: "Other Candidate",
            releaseYear: "2007",
            wave: Wave.BARRAKI,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1010"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const hakannCandidate = result.find(
          (item) => item.set.catalogNumber === "1011",
        );

        expect(
          hakannCandidate?.reasons.some((reason) =>
            reason.includes("character version"),
          ),
        ).toBe(false);
        expect(hakannCandidate?.score).toBe(0);
      });

      it("counts minifigure variation completion per character variation that is still missing", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1020",
            name: "Owned Hewkii Inika",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
            minifigures: [
              { character: BionicleCharacter.HEWKII, variation: "INIKA" },
            ],
          }),
          setFixture({
            catalogNumber: "1021",
            name: "Candidate Hewkii Bio018",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
            minifigures: [
              { character: BionicleCharacter.HEWKII, variation: "bio018" },
            ],
          }),
          setFixture({
            catalogNumber: "1022",
            name: "Candidate Hewkii Inika Again",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
            minifigures: [
              { character: BionicleCharacter.HEWKII, variation: "INIKA" },
            ],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1020"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const missingVariationCandidate = result.find(
          (item) => item.set.catalogNumber === "1021",
        );
        const ownedVariationCandidate = result.find(
          (item) => item.set.catalogNumber === "1022",
        );

        expect(
          missingVariationCandidate?.reasons
            .join(" ")
            .includes("character version"),
        ).toBe(true);
        expect(
          ownedVariationCandidate?.reasons.some((reason) =>
            reason.includes("character version"),
          ),
        ).toBe(false);
        expect(missingVariationCandidate?.score).toBe(80);
      });

      it("applies character completion once when set has multiple qualifying minifigure characters", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1025",
            name: "Owned Tahu",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1026",
            name: "Owned Gali",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.GALI],
          }),
          setFixture({
            catalogNumber: "1027",
            name: "Owned Onua",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.ONUA],
          }),
          setFixture({
            catalogNumber: "1028",
            name: "Candidate Triple Minifigs",
            releaseYear: "2007",
            wave: Wave.BARRAKI,
            minifigures: [
              { character: BionicleCharacter.TAHU, variation: "a" },
              { character: BionicleCharacter.GALI, variation: "a" },
              { character: BionicleCharacter.ONUA, variation: "a" },
            ],
          }),
        ];

        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1025", "1026", "1027"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find((item) => item.set.catalogNumber === "1028");

        expect(candidate).toBeDefined();
        expect(
          candidate?.reasons.filter((reason) =>
            reason.includes("Only 1 character version left to complete"),
          ).length,
        ).toBe(3);
        // Missing versions: 1 per character => 3 total, single completion contribution.
        expect(candidate?.score).toBeCloseTo(80 / 3, 6);
      });

      it("does not apply character completion when user has zero progress on that character", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1030",
            name: "Owned Gali",
            releaseYear: "2005",
            wave: Wave.TOA_HORDIKA,
            characters: [BionicleCharacter.GALI],
          }),
          setFixture({
            catalogNumber: "1031",
            name: "Candidate Tahu",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
            characters: [BionicleCharacter.TAHU],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1030"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find(
          (item) => item.set.catalogNumber === "1031",
        );

        expect(
          candidate?.reasons.some((reason) =>
            reason.includes("left to complete Tahu"),
          ),
        ).toBe(false);
        expect(candidate?.score).toBe(0);
      });

      it("does not apply character completion until at least half of character versions are owned", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1035",
            name: "Owned Tahu",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1036",
            name: "Unowned Tahu 1",
            releaseYear: "2002",
            wave: Wave.BOHROK,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1037",
            name: "Unowned Tahu 2",
            releaseYear: "2003",
            wave: Wave.RAHKSHI,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1038",
            name: "Candidate Tahu",
            releaseYear: "2004",
            wave: Wave.METRUAN,
            characters: [BionicleCharacter.TAHU],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1035"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find((item) => item.set.catalogNumber === "1038");

        expect(
          candidate?.reasons.some((reason) =>
            reason.includes("left to complete Tahu"),
          ),
        ).toBe(false);
        expect(candidate?.score).toBe(0);
      });

      it("ignores not-interested sets for character progress and discovery", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1040",
            name: "Not Interested Tahu",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1041",
            name: "Candidate Tahu",
            releaseYear: "2002",
            wave: Wave.BOHROK,
            characters: [BionicleCharacter.TAHU],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue([]),
          }),
          userWishlistRepository: userWishlistRepositoryMock({
            getWishlistState: vi.fn().mockResolvedValue({
              "1040": UserWishlistScale.NOT_INTERESTED,
            }),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 5,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find(
          (item) => item.set.catalogNumber === "1041",
        );

        expect(
          candidate?.reasons.some((reason) =>
            reason.includes("left to complete Tahu"),
          ),
        ).toBe(false);
        expect(
          candidate?.reasons.some((reason) => reason.includes("Discover Tahu")),
        ).toBe(true);
        expect(candidate?.score).toBe(5);
      });

      it("ignores not-interested owned sets for character progress and discovery", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1040",
            name: "Owned but Not Interested Tahu",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
            characters: [BionicleCharacter.TAHU],
          }),
          setFixture({
            catalogNumber: "1041",
            name: "Candidate Tahu",
            releaseYear: "2002",
            wave: Wave.BOHROK,
            characters: [BionicleCharacter.TAHU],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1040"]),
          }),
          userWishlistRepository: userWishlistRepositoryMock({
            getWishlistState: vi.fn().mockResolvedValue({
              "1040": UserWishlistScale.NOT_INTERESTED,
            }),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 5,
            generationCompletion: 0,
            generationDiscovery: 0,
            averageRating: 0,
            characterCompletion: 80,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find(
          (item) => item.set.catalogNumber === "1041",
        );

        expect(
          candidate?.reasons.some((reason) =>
            reason.includes("left to complete Tahu"),
          ),
        ).toBe(false);
        expect(
          candidate?.reasons.some((reason) => reason.includes("Discover Tahu")),
        ).toBe(true);
        expect(candidate?.score).toBe(5);
      });

      it("stacks character discovery for distinct candidate characters with weight 5 each", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1050",
            name: "Owned Kopaka",
            releaseYear: "2005",
            wave: Wave.TOA_HORDIKA,
            characters: [BionicleCharacter.KOPAKA],
          }),
          setFixture({
            catalogNumber: "1051",
            name: "Two New Characters",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
            minifigures: [
              { character: BionicleCharacter.TAHU, variation: "alpha" },
              { character: BionicleCharacter.GALI, variation: "alpha" },
            ],
          }),
          setFixture({
            catalogNumber: "1052",
            name: "One New Character",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
            characters: [BionicleCharacter.TAHU],
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1050"]),
          }),
        });

        const result = await service.getRecommendations("user-1");
        const twoCharacterCandidate = result.find(
          (item) => item.set.catalogNumber === "1051",
        );
        const oneCharacterCandidate = result.find(
          (item) => item.set.catalogNumber === "1052",
        );

        expect(
          twoCharacterCandidate?.reasons.filter((reason) =>
            reason.startsWith("Discover "),
          ).length,
        ).toBe(2);
        expect(
          (twoCharacterCandidate?.score ?? 0) -
            (oneCharacterCandidate?.score ?? 0),
        ).toBe(5);
      });

      it("adds G1 completion with weight 150 when one set remains", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1060",
            name: "Owned G1",
            releaseYear: "2004",
            wave: Wave.METRUAN,
          }),
          setFixture({
            catalogNumber: "1061",
            name: "Candidate G1",
            releaseYear: "2005",
            wave: Wave.RAHAGA,
          }),
          setFixture({
            catalogNumber: "1062",
            name: "Non G1 Candidate",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1060"]),
          }),
        });

        const result = await service.getRecommendations("user-1");
        const g1Candidate = result.find(
          (item) => item.set.catalogNumber === "1061",
        );
        const nonG1Candidate = result.find(
          (item) => item.set.catalogNumber === "1062",
        );

        expect(g1Candidate?.reasons.join(" ")).toContain("left to complete G1");
        expect((g1Candidate?.score ?? 0) - (nonG1Candidate?.score ?? 0)).toBe(
          150,
        );
      });

      it("does not apply generation completion when more than 10 sets are missing", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1065",
            name: "Owned G1",
            releaseYear: "2005",
            wave: Wave.TOA_HORDIKA,
          }),
          ...Array.from({ length: 11 }, (_, index) =>
            setFixture({
              catalogNumber: `${1066 + index}`,
              name: `G1 Candidate ${index + 1}`,
              releaseYear: "2006",
              wave: Wave.PIRAKA,
            }),
          ),
        ];

        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1065"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            characterCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 150,
            generationDiscovery: 0,
            averageRating: 0,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find((item) => item.set.catalogNumber === "1066");

        expect(
          candidate?.reasons.some((reason) => reason.includes("complete G1")),
        ).toBe(false);
        expect(candidate?.score).toBe(0);
      });

      it("adds G1 discovery only when user has no G1 sets", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1070",
            name: "Owned G2",
            releaseYear: "2015",
            wave: Wave.TOA_MASTERS,
          }),
          setFixture({
            catalogNumber: "1071",
            name: "Candidate G1",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1070"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            characterCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 20,
            averageRating: 0,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find(
          (item) => item.set.catalogNumber === "1071",
        );

        expect(
          candidate?.reasons.some((reason) => reason.includes("Check out G1")),
        ).toBe(true);
        expect(candidate?.score).toBe(20);
      });

      it("does not add G1 or G2 scoring for non-generation years", async () => {
        const sets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1080",
            name: "Owned G1",
            releaseYear: "2006",
            wave: Wave.PIRAKA,
          }),
          setFixture({
            catalogNumber: "1081",
            name: "Candidate 2012",
            releaseYear: "2012",
            wave: Wave.MISCELLANEOUS,
          }),
        ];
        const service = recommendationsServiceMock({
          setsRepository: new SetsRepository(sets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1080"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            characterCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 150,
            generationDiscovery: 20,
            averageRating: 0,
          },
        });

        const result = await service.getRecommendations("user-1");
        const candidate = result.find(
          (item) => item.set.catalogNumber === "1081",
        );

        expect(
          candidate?.reasons.some((reason) => reason.includes("complete G1")),
        ).toBe(false);
        expect(
          candidate?.reasons.some((reason) => reason.includes("Check out G1")),
        ).toBe(false);
        expect(
          candidate?.reasons.some((reason) => reason.includes("complete G2")),
        ).toBe(false);
        expect(
          candidate?.reasons.some((reason) => reason.includes("Check out G2")),
        ).toBe(false);
        expect(candidate?.score).toBe(0);
      });

      it("adds G2 completion and G2 discovery as expected", async () => {
        const g2CompletionSets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1090",
            name: "Owned G2",
            releaseYear: "2015",
            wave: Wave.TOA_MASTERS,
          }),
          setFixture({
            catalogNumber: "1091",
            name: "Candidate G2",
            releaseYear: "2016",
            wave: Wave.TOA_UNITERS,
          }),
        ];
        const completionService = recommendationsServiceMock({
          setsRepository: new SetsRepository(g2CompletionSets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1090"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            characterCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 150,
            generationDiscovery: 0,
            averageRating: 0,
          },
        });

        const completionResult =
          await completionService.getRecommendations("user-1");
        const completionCandidate = completionResult.find(
          (item) => item.set.catalogNumber === "1091",
        );
        expect(completionCandidate?.reasons.join(" ")).toContain(
          "left to complete G2",
        );
        expect(completionCandidate?.score).toBe(150);

        const g2DiscoverySets: BionicleSet[] = [
          setFixture({
            catalogNumber: "1092",
            name: "Owned G1",
            releaseYear: "2006",
            wave: Wave.TOA_INIKA,
          }),
          setFixture({
            catalogNumber: "1093",
            name: "Candidate G2 Discovery",
            releaseYear: "2016",
            wave: Wave.SHADOW_HORDE,
          }),
        ];
        const discoveryService = recommendationsServiceMock({
          setsRepository: new SetsRepository(g2DiscoverySets),
          userCollectionRepository: userCollectionRepositoryMock({
            getUserCollection: vi.fn().mockResolvedValue(["1092"]),
          }),
          recommendationWeights: {
            wishlist: 0,
            yearCompletion: 0,
            waveCompletion: 0,
            characterCompletion: 0,
            discoveryYear: 0,
            discoveryWave: 0,
            discoveryCharacter: 0,
            generationCompletion: 0,
            generationDiscovery: 20,
            averageRating: 0,
          },
        });

        const discoveryResult =
          await discoveryService.getRecommendations("user-1");
        const discoveryCandidate = discoveryResult.find(
          (item) => item.set.catalogNumber === "1093",
        );
        expect(
          discoveryCandidate?.reasons.some((reason) =>
            reason.includes("Check out G2"),
          ),
        ).toBe(true);
        expect(discoveryCandidate?.score).toBe(20);
      });
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
