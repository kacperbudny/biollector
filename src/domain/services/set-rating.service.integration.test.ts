import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { SetRatingRepository } from "@/data/repositories/set-rating.repository";
import { SetRatingService } from "@/domain/services/set-rating.service";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationSetRatingRepository,
  getIntegrationSetRatingService,
} from "@/tests/integration";

describe(SetRatingService.name, () => {
  let setRatingRepository: SetRatingRepository;
  let setRatingService: SetRatingService;

  beforeAll(() => {
    setRatingRepository = getIntegrationSetRatingRepository();
    setRatingService = getIntegrationSetRatingService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${SetRatingService.prototype.getTotalRatingsCount.name}`, () => {
    it("returns the number of ratings stored", async () => {
      expect(await setRatingService.getTotalRatingsCount()).toBe(0);
      await setRatingService.setRating("user-a", "8534", 4);
      await setRatingService.setRating("user-b", "1388", 5);
      expect(await setRatingService.getTotalRatingsCount()).toBe(2);
    });
  });

  describe(`${SetRatingService.prototype.setRating.name}`, () => {
    it("sets the rating successfully", async () => {
      await setRatingService.setRating("user-123", "8534", 4);

      const ratings = await setRatingRepository.getUserRatings("user-123");
      expect(ratings["8534"]).toBe(4);
    });
  });
});
