import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { SetRatingService } from "@/domain/services/set-rating.service";
import { Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import { setRatingRepositoryMock } from "@/tests/repositories";

describe(`@Unit ${SetRatingService.name}`, () => {
  describe(`${SetRatingService.prototype.setRating.name}`, () => {
    it("sets the rating successfully", async () => {
      const setsRepo = new SetsRepository([
        setFixture({
          catalogNumber: "8534",
          name: "Test",
          releaseYear: "2004",
          wave: Wave.TOA_METRU,
        }),
      ]);
      const ratingMock = setRatingRepositoryMock({
        setRating: vi.fn().mockResolvedValue(undefined),
      });
      const service = new SetRatingService(setsRepo, ratingMock);

      await service.setRating("user-123", "8534", 4);

      expect(ratingMock.setRating).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          setNumber: "8534",
          rating: 4,
        }),
      );
    });

    it("throws when set does not exist", async () => {
      const setsRepo = new SetsRepository([]);
      const ratingMock = setRatingRepositoryMock({
        setRating: vi.fn().mockResolvedValue(undefined),
      });
      const service = new SetRatingService(setsRepo, ratingMock);

      await expect(service.setRating("user-123", "99999", 4)).rejects.toThrow(
        "Set not found: 99999",
      );

      expect(ratingMock.setRating).not.toHaveBeenCalled();
    });
  });
});
