import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { SetsService } from "@/domain/services/sets.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import {
  setRatingRepositoryMock,
  userCollectionRepositoryMock,
} from "@/tests/repositories";

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
      );

      const result = await service.getSetsListViewModel();

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      expect(allSets[0]?.userRating).toBeUndefined();
    });
  });
});
