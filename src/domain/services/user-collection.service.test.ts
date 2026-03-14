import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { UserCollectionService } from "@/domain/services/user-collection.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import {
  setRatingRepositoryMock,
  userCollectionRepositoryMock,
  userWishlistRepositoryMock,
} from "@/tests/repositories";

describe(`@Unit ${UserCollectionService.name}`, () => {
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
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
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
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
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
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      await expect(service.toggleSet("user-123", "99999")).rejects.toThrow(
        "Set not found: 99999",
      );
    });
  });

  describe(`${UserCollectionService.prototype.getCollectionListViewModel.name}`, () => {
    it("returns sets grouped by year and wave", async () => {
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
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1", "3", "5", "6"]),
        }),
        new SetsRepository(sets),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({}),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");
      const [year2001, year2002] = result.data;
      const [toaMata] = year2001.waves;
      const [bohrokVa, toaNuva] = year2002.waves;

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(6);
      expect(result.collectionCount).toBe(4);

      expect(year2001.year).toBe("2001");
      expect(year2001.totalCount).toBe(3);
      expect(year2001.collectionCount).toBe(2);
      expect(year2001.waves).toHaveLength(1);

      expect(toaMata.wave).toBe(Wave.TOA_MATA);
      expect(toaMata.totalCount).toBe(3);
      expect(toaMata.collectionCount).toBe(2);
      expect(toaMata.isComplete).toBe(false);
      expect(toaMata.sets).toHaveLength(2);
      expect(toaMata.sets.map((s) => s.catalogNumber)).toEqual(["1", "3"]);
      expect(toaMata.sets.every((s) => s.isInCollection)).toBe(true);

      expect(year2002.year).toBe("2002");
      expect(year2002.totalCount).toBe(3);
      expect(year2002.collectionCount).toBe(2);
      expect(year2002.waves).toHaveLength(2);

      expect(bohrokVa.wave).toBe(Wave.BOHROK_VA);
      expect(bohrokVa.totalCount).toBe(1);
      expect(bohrokVa.collectionCount).toBe(1);
      expect(bohrokVa.isComplete).toBe(true);
      expect(bohrokVa.sets).toHaveLength(1);
      expect(bohrokVa.sets.map((s) => s.catalogNumber)).toEqual(["6"]);

      expect(toaNuva.wave).toBe(Wave.TOA_NUVA);
      expect(toaNuva.totalCount).toBe(2);
      expect(toaNuva.collectionCount).toBe(1);
      expect(toaNuva.isComplete).toBe(false);
      expect(toaNuva.sets).toHaveLength(1);
      expect(toaNuva.sets.map((s) => s.catalogNumber)).toEqual(["5"]);
    });

    it("returns no sections when user has no sets in collection", async () => {
      const sets: BionicleSet[] = [
        setFixture({
          catalogNumber: "1",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue([]),
        }),
        new SetsRepository(sets),
        setRatingRepositoryMock(),
        userWishlistRepositoryMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.totalCount).toBe(1);
      expect(result.collectionCount).toBe(0);
      expect(result.data).toHaveLength(0);
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
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1", "999"]),
        }),
        new SetsRepository(sets),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({}),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].waves[0].sets).toHaveLength(1);
      expect(result.data[0].waves[0].sets[0].catalogNumber).toBe("1");
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
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1", "2"]),
        }),
        new SetsRepository(sets),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({ "1": 5, "2": 3 }),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      const set1 = allSets.find((s) => s.catalogNumber === "1");
      const set2 = allSets.find((s) => s.catalogNumber === "2");
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
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1", "2"]),
        }),
        new SetsRepository(sets),
        setRatingRepositoryMock({
          getUserRatings: vi.fn().mockResolvedValue({}),
          getAverageRatings: vi.fn().mockResolvedValue({
            "1": 4.5,
            "2": 3,
          }),
        }),
        userWishlistRepositoryMock(),
      );

      const result = await service.getCollectionListViewModel("user-123");

      const allSets = result.data.flatMap((y) =>
        y.waves.flatMap((w) => w.sets),
      );
      const set1 = allSets.find((s) => s.catalogNumber === "1");
      const set2 = allSets.find((s) => s.catalogNumber === "2");
      expect(set1?.averageRating).toBe(4.5);
      expect(set2?.averageRating).toBe(3);
    });
  });
});
