import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { SetRatingService } from "@/domain/services/set-rating.service";
import { Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import {
  setRatingRepositoryMock,
  setViewModelContextLoaderMock,
} from "@/tests/unit";

describe(SetRatingService.name, () => {
  describe(`${SetRatingService.prototype.getRatingsViewModel.name}`, () => {
    it("returns rated sets grouped by star rating", async () => {
      const setsRepo = new SetsRepository([
        setFixture({
          catalogNumber: "8534",
          name: "Test A",
          releaseYear: "2004",
          wave: Wave.TOA_METRU,
        }),
        setFixture({
          catalogNumber: "1388",
          name: "Test B",
          releaseYear: "2002",
          wave: Wave.TOA_MATA,
        }),
      ]);
      const contextLoader = setViewModelContextLoaderMock({
        setRating: {
          getUserRatings: vi.fn().mockResolvedValue({ "8534": 5, "1388": 4 }),
        },
      });
      const service = new SetRatingService(
        setsRepo,
        setRatingRepositoryMock(),
        contextLoader,
      );

      const vm = await service.getRatingsViewModel("user-123");

      expect(vm.totalCount).toBe(2);
      expect(vm.sections).toHaveLength(2);
      expect(vm.sections[0].rating).toBe(5);
      expect(vm.sections[0].label).toBe("5 stars");
      expect(vm.sections[0].sets.map((s) => s.catalogNumber)).toEqual(["8534"]);
      expect(vm.sections[1].rating).toBe(4);
      expect(vm.sections[1].label).toBe("4 stars");
      expect(vm.sections[1].sets.map((s) => s.catalogNumber)).toEqual(["1388"]);
    });

    it("returns empty view model when user has no ratings", async () => {
      const service = new SetRatingService(
        new SetsRepository([]),
        setRatingRepositoryMock(),
        setViewModelContextLoaderMock(),
      );

      const vm = await service.getRatingsViewModel("user-123");

      expect(vm.totalCount).toBe(0);
      expect(vm.sections).toHaveLength(0);
    });
  });

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
      const service = new SetRatingService(
        setsRepo,
        ratingMock,
        setViewModelContextLoaderMock(),
      );

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
      const service = new SetRatingService(
        setsRepo,
        ratingMock,
        setViewModelContextLoaderMock(),
      );

      await expect(service.setRating("user-123", "99999", 4)).rejects.toThrow(
        "Set not found: 99999",
      );

      expect(ratingMock.setRating).not.toHaveBeenCalled();
    });
  });
});
