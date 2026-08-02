import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { UserCollectionService } from "@/domain/services/user-collection.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import {
  getUserCollectionMock,
  setViewModelContextLoaderMock,
  userCollectionRepositoryMock,
} from "@/tests/unit";

describe(UserCollectionService.name, () => {
  describe(`${UserCollectionService.prototype.toggleSet.name}`, () => {
    it("removes set from collection when already in collection", async () => {
      const mock = userCollectionRepositoryMock({
        isInCollection: vi.fn().mockResolvedValue(true),
      });
      const setsRepo = new SetsRepository([
        setFixture({
          catalogNumber: "1",
          name: "Test",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ]);
      const service = new UserCollectionService(
        mock,
        setsRepo,
        setViewModelContextLoaderMock(),
      );

      await service.toggleSet("user-123", "1");

      expect(mock.deleteFromCollection).toHaveBeenCalledWith("user-123", "1");
      expect(mock.insert).not.toHaveBeenCalled();
    });

    it("adds set to collection when not in collection", async () => {
      const mock = userCollectionRepositoryMock({
        isInCollection: vi.fn().mockResolvedValue(false),
      });
      const setsRepo = new SetsRepository([
        setFixture({
          catalogNumber: "1",
          name: "Test",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ]);
      const service = new UserCollectionService(
        mock,
        setsRepo,
        setViewModelContextLoaderMock(),
      );

      await service.toggleSet("user-123", "1");

      expect(mock.insert).toHaveBeenCalledWith("user-123", "1");
      expect(mock.deleteFromCollection).not.toHaveBeenCalled();
    });

    it("throws when set does not exist", async () => {
      const service = new UserCollectionService(
        userCollectionRepositoryMock({
          isInCollection: vi.fn().mockResolvedValue(false),
        }),
        new SetsRepository([]),
        setViewModelContextLoaderMock(),
      );

      await expect(service.toggleSet("user-123", "99999")).rejects.toThrow(
        "Set not found: 99999",
      );
    });
  });

  describe(`${UserCollectionService.prototype.getCollectionListViewModel.name}`, () => {
    it("returns user sets and total count", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "3",
          name: "Lewa",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "4",
          name: "Pohatu Nuva",
          releaseYear: "2002",
          wave: Wave.TOA_NUVA,
        }),
        setFixture({
          catalogNumber: "5",
          name: "Tahu Nuva",
          releaseYear: "2002",
          wave: Wave.TOA_NUVA,
        }),
        setFixture({
          catalogNumber: "6",
          name: "Gahlok Va",
          releaseYear: "2002",
          wave: Wave.BOHROK_VA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock(),
        new SetsRepository(sets),
        setViewModelContextLoaderMock({
          userCollection: {
            getUserCollection: getUserCollectionMock(["1", "3", "5", "6"]),
          },
        }),
      );

      const result = await service.getCollectionListViewModel("user-123");
      expect(result.sets).toHaveLength(4);
      expect(result.totalCount).toBe(4);
      expect(result.sets.map((s) => s.catalogNumber)).toEqual([
        "1",
        "3",
        "5",
        "6",
      ]);
    });

    it("returns zero totalCount when user has no sets in collection", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock(),
        new SetsRepository(sets),
        setViewModelContextLoaderMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.totalCount).toBe(0);
      expect(result.sets).toHaveLength(0);
    });

    it("excludes set numbers not found in catalog", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock(),
        new SetsRepository(sets),
        setViewModelContextLoaderMock({
          userCollection: {
            getUserCollection: getUserCollectionMock(["1", "999"]),
          },
        }),
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.sets).toHaveLength(1);
      expect(result.sets[0].catalogNumber).toBe("1");
    });

    it("includes user ratings on set view models", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock(),
        new SetsRepository(sets),
        setViewModelContextLoaderMock({
          userCollection: {
            getUserCollection: getUserCollectionMock(["1", "2"]),
          },
          setRating: {
            getUserRatings: vi.fn().mockResolvedValue({ "1": 5, "2": 3 }),
          },
        }),
      );

      const result = await service.getCollectionListViewModel("user-123");

      const set1 = result.sets.find((s) => s.catalogNumber === "1");
      const set2 = result.sets.find((s) => s.catalogNumber === "2");
      expect(set1?.userRating).toBe(5);
      expect(set2?.userRating).toBe(3);
    });

    it("includes average ratings on set view models", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "2",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock(),
        new SetsRepository(sets),
        setViewModelContextLoaderMock({
          userCollection: {
            getUserCollection: getUserCollectionMock(["1", "2"]),
          },
          setRating: {
            getAverageRatings: vi.fn().mockResolvedValue({
              "1": 4.5,
              "2": 3,
            }),
          },
        }),
      );

      const result = await service.getCollectionListViewModel("user-123");

      const set1 = result.sets.find((s) => s.catalogNumber === "1");
      const set2 = result.sets.find((s) => s.catalogNumber === "2");
      expect(set1?.averageRating).toBe(4.5);
      expect(set2?.averageRating).toBe(3);
    });
  });
});
