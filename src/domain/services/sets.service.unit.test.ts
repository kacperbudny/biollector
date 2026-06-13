import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { SetsService } from "@/domain/services/sets.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import type {
  NestedSetSection,
  SetsGroupedViewModel,
} from "@/domain/view-models/sets-grouped.view-model";
import { setFixture } from "@/tests/fixtures";
import { setViewModelContextLoaderMock } from "@/tests/unit";

describe(SetsService.name, () => {
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
        setViewModelContextLoaderMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.sections.map((s) => s.label)).toEqual(["2001", "2006"]);
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
        setViewModelContextLoaderMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.sections).toHaveLength(1);
      const section = result.sections[0] as NestedSetSection;
      expect(section.label).toBe("2001");

      expect(section.groups.map((g) => g.label)).toEqual([
        Wave.TOHUNGA,
        Wave.TOA_MATA,
      ]);
      expect(section.groups[0].sets).toHaveLength(1);
      expect(section.groups[0].sets[0].name).toBe("Tohunga");
      expect(section.groups[1].sets).toHaveLength(1);
      expect(section.groups[1].sets[0].name).toBe("Toa");
    });

    it("returns empty array when repository returns no sets", async () => {
      const service = new SetsService(
        new SetsRepository([]),
        setViewModelContextLoaderMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.sections).toEqual([]);
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
        setViewModelContextLoaderMock({
          userCollection: {
            getUserCollection: vi.fn().mockResolvedValue(["1"]),
          },
        }),
      );

      const result = await service.getSetsListViewModel("user-123");

      const resultSets = flattenSets(result);
      const set1 = resultSets.find((s) => s.catalogNumber === "1");
      const set2 = resultSets.find((s) => s.catalogNumber === "2");
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
        setViewModelContextLoaderMock({
          setRating: {
            getUserRatings: vi.fn().mockResolvedValue({ "1": 4 }),
          },
        }),
      );

      const result = await service.getSetsListViewModel("user-123");

      const resultSets = flattenSets(result);
      const set1 = resultSets.find((s) => s.catalogNumber === "1");
      const set2 = resultSets.find((s) => s.catalogNumber === "2");
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
        setViewModelContextLoaderMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(flattenSets(result)[0]?.userRating).toBeUndefined();
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
        setViewModelContextLoaderMock({
          setRating: {
            getAverageRatings: vi.fn().mockResolvedValue({ "1": 4.2 }),
          },
        }),
      );

      const result = await service.getSetsListViewModel();

      const resultSets = flattenSets(result);
      const set1 = resultSets.find((s) => s.catalogNumber === "1");
      const set2 = resultSets.find((s) => s.catalogNumber === "2");
      expect(set1?.averageRating).toBe(4.2);
      expect(set2?.averageRating).toBeUndefined();
    });
  });
});

function flattenSets(result: SetsGroupedViewModel) {
  return result.sections.flatMap((s) =>
    (s as NestedSetSection).groups.flatMap((g) => g.sets),
  );
}
