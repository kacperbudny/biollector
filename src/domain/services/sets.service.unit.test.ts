import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { SetsService } from "@/domain/services/sets.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import {
  getUserCollectionMock,
  setViewModelContextLoaderMock,
} from "@/tests/unit";

describe(SetsService.name, () => {
  describe(`${SetsService.prototype.getSetsListViewModel.name}`, () => {
    it("returns sets list and total count", async () => {
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

      expect(result.totalCount).toBe(2);
      expect(result.sets.map((s) => s.catalogNumber)).toEqual(["1", "2"]);
    });

    it("returns empty array when repository returns no sets", async () => {
      const service = new SetsService(
        new SetsRepository([]),
        setViewModelContextLoaderMock(),
      );

      const result = await service.getSetsListViewModel();

      expect(result.sets).toEqual([]);
      expect(result.totalCount).toBe(0);
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
            getUserCollection: getUserCollectionMock(["1"]),
          },
        }),
      );

      const result = await service.getSetsListViewModel("user-123");

      const set1 = result.sets.find((s) => s.catalogNumber === "1");
      const set2 = result.sets.find((s) => s.catalogNumber === "2");
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

      const set1 = result.sets.find((s) => s.catalogNumber === "1");
      const set2 = result.sets.find((s) => s.catalogNumber === "2");
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

      expect(result.sets[0]?.userRating).toBeUndefined();
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

      const set1 = result.sets.find((s) => s.catalogNumber === "1");
      const set2 = result.sets.find((s) => s.catalogNumber === "2");
      expect(set1?.averageRating).toBe(4.2);
      expect(set2?.averageRating).toBeUndefined();
    });
  });

  describe(`${SetsService.prototype.searchSets.name}`, () => {
    it("returns an empty result for a blank query", () => {
      const service = new SetsService(
        new SetsRepository([
          setFixture({
            catalogNumber: "8534",
            name: "Tahu",
            releaseYear: "2001",
            wave: Wave.TOA_MATA,
          }),
        ]),
        setViewModelContextLoaderMock(),
      );

      expect(service.searchSets("")).toEqual({ sets: [], totalCount: 0 });
      expect(service.searchSets("   ")).toEqual({ sets: [], totalCount: 0 });
    });

    it("ranks, caps the list, and reports the untruncated match count", () => {
      const sets: BionicleSet[] = Array.from({ length: 12 }, (_, i) =>
        setFixture({
          catalogNumber: String(i + 1),
          name: `Tahu ${i + 1}`,
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      );
      sets.push(
        setFixture({
          catalogNumber: "tahu",
          name: "Gali",
          releaseYear: "2006",
          wave: Wave.TOA_INIKA,
        }),
      );
      const service = new SetsService(
        new SetsRepository(sets),
        setViewModelContextLoaderMock(),
      );

      const result = service.searchSets("tahu", { limit: 10 });

      expect(result.totalCount).toBe(13);
      expect(result.sets).toHaveLength(10);
      expect(result.sets[0]?.catalogNumber).toBe("tahu");
      expect(result.sets[0]).toMatchObject({
        name: "Gali",
        imageName: "test.png",
        releaseYear: "2006",
        wave: Wave.TOA_INIKA,
      });
    });
  });
});
