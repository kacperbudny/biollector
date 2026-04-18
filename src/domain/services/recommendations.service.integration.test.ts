import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { RecommendationsService } from "@/domain/services/recommendations.service";
import { truncateTestDb } from "@/tests/db";
import { getIntegrationRecommendationsService } from "@/tests/integration";

describe(RecommendationsService.name, () => {
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
