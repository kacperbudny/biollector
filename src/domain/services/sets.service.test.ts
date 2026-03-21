import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { bionicleSets } from "@/data/sets";
import type { SetRatingService } from "@/domain/services/set-rating.service";
import { SetsService } from "@/domain/services/sets.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { truncateTestDb } from "@/tests/db";
import { setFixture } from "@/tests/fixtures";
import {
  getIntegrationSetRatingService,
  getIntegrationSetsService,
} from "@/tests/integration";
import {
  setRatingRepositoryMock,
  userCollectionRepositoryMock,
  userWishlistRepositoryMock,
} from "@/tests/unit";

describe(`@Unit ${SetsService.name}`, () => {
  describe(`${SetsService.prototype.getSetsListViewModel.name}`, () => {
    it("returns years in ascending order", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "A",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "B",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock(),
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.data.map((r) => r.year)).toEqual(["2001", "2006"]);
    });

    it("groups sets by year and wave according to Wave enum order", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Toa",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Tohunga",
          releaseYear: "2001",
          wave: Wave.TOHUNGA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock(),
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].year).toBe("2001");
      expect(result.data[0].waves.map((w) => w.wave)).toEqual([
        Wave.TOHUNGA,
        Wave.TOA_MATA,
      ]);
      expect(result.data[0].waves[0].sets).toHaveLength(1);
      expect(result.data[0].waves[0].sets[0].name).toBe("Tohunga");
      expect(result.data[0].waves[1].sets).toHaveLength(1);
      expect(result.data[0].waves[1].sets[0].name).toBe("Toa");
    });

    it("returns empty array when repository returns no sets", async () => {
      const service = new SetsService(
        new SetsRepository([]),
        userCollectionRepositoryMock(),
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.data).toEqual([]);
    });

    it("properly marks sets in user collection", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "InCollection",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "NotInCollection",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1"]),
        }),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({}),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel("user-123");

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      const set1 = allSets.find((s) => s.catalogNumber === "1");
      const set2 = allSets.find((s) => s.catalogNumber === "2");
      expect(set1?.isInCollection).toBe(true);
      expect(set2?.isInCollection).toBe(false);
    });

    it("includes user rating when userId is provided", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Rated",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Unrated",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue([]),
        }),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({ "1": 4 }),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel("user-123");

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      const set1 = allSets.find((s) => s.catalogNumber === "1");
      const set2 = allSets.find((s) => s.catalogNumber === "2");
      expect(set1?.userRating).toBe(4);
      expect(set2?.userRating).toBeUndefined();
    });

    it("omits user rating when userId is not provided", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Set",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock(),
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel();

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      expect(allSets[0]?.userRating).toBeUndefined();
    });

    it("includes average rating when getAverageRatings returns data", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Rated",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Unrated",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new SetsService(
        new SetsRepository(sets),
        userCollectionRepositoryMock(),
        setRatingRepositoryMock({
          getAverageRatings: vi.fn().mockResolvedValue({ "1": 4.2 }),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getSetsListViewModel();

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      const set1 = allSets.find((s) => s.catalogNumber === "1");
      const set2 = allSets.find((s) => s.catalogNumber === "2");
      expect(set1?.averageRating).toBe(4.2);
      expect(set2?.averageRating).toBeUndefined();
    });
  });
});

describe(`@Integration ${SetsService.name}`, () => {
  let setsService: SetsService;
  let setRatingService: SetRatingService;

  beforeAll(() => {
    setsService = getIntegrationSetsService();
    setRatingService = getIntegrationSetRatingService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${SetsService.prototype.getRandomSets.name}`, () => {
    it("returns distinct random sets from the catalog", async () => {
      const result = await setsService.getRandomSets(3);
      expect(result).toHaveLength(3);
      expect(new Set(result.map((s) => s.catalogNumber)).size).toBe(3);
    });
  });

  describe(`${SetsService.prototype.getTopRatedSets.name}`, () => {
    it("returns sets ordered by community average rating", async () => {
      await setRatingService.setRating("r1", "8534", 5);
      await setRatingService.setRating("r2", "8534", 4);
      await setRatingService.setRating("r3", "1388", 2);
      const top = await setsService.getTopRatedSets(2);
      expect(top).toHaveLength(2);
      const byNumber = Object.fromEntries(
        top.map((s) => [s.catalogNumber, s.averageRating]),
      );
      expect(byNumber["8534"]).toBe(4.5);
      expect(byNumber["1388"]).toBe(2);
    });
  });

  describe(`${SetsService.prototype.getSetsListViewModel.name}`, () => {
    it("returns grouped years and waves for the full catalog", async () => {
      const result = await setsService.getSetsListViewModel();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.totalCount).toBe(bionicleSets.length);
      expect(result.data[0].year).toBe("2001");
      expect(result.data[0].waves[0].wave).toBe(Wave.TURAGA);
    });
  });
});
