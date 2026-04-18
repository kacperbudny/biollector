import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { bionicleSets } from "@/data/sets";
import type { SetRatingService } from "@/domain/services/set-rating.service";
import { SetsService } from "@/domain/services/sets.service";
import { Wave } from "@/domain/sets";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationSetRatingService,
  getIntegrationSetsService,
} from "@/tests/integration";

describe(SetsService.name, () => {
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
