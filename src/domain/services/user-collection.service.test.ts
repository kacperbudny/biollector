import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { UserCollectionService } from "@/domain/services/user-collection.service";
import { type BionicleSet, Wave } from "@/domain/sets";
import { setFixture } from "@/tests/fixtures";
import { userCollectionRepositoryMock } from "@/tests/repositories";

describe(`@Unit ${UserCollectionService.name}`, () => {
  describe(`${UserCollectionService.prototype.toggleSet.name}`, () => {
    it("removes set from collection when already in collection", async () => {
      const mock = userCollectionRepositoryMock({
        isInCollection: vi.fn().mockResolvedValue(true),
      });
      const service = new UserCollectionService(mock, new SetsRepository([]));

      await service.toggleSet("user-123", "1");

      expect(mock.deleteFromCollection).toHaveBeenCalledWith("user-123", "1");
      expect(mock.insert).not.toHaveBeenCalled();
    });

    it("adds set to collection when not in collection", async () => {
      const mock = userCollectionRepositoryMock({
        isInCollection: vi.fn().mockResolvedValue(false),
      });
      const service = new UserCollectionService(mock, new SetsRepository([]));

      await service.toggleSet("user-123", "1");

      expect(mock.insert).toHaveBeenCalledWith("user-123", "1");
      expect(mock.deleteFromCollection).not.toHaveBeenCalled();
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
      ];
      const service = new UserCollectionService(
        userCollectionRepositoryMock({
          getUserCollection: vi.fn().mockResolvedValue(["1", "3"]),
        }),
        new SetsRepository(sets),
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].year).toBe("2001");
      expect(result.data[0].waves).toHaveLength(1);
      expect(result.data[0].waves[0].sets).toHaveLength(2);
      expect(result.data[0].waves[0].sets.map((s) => s.catalogNumber)).toEqual([
        "1",
        "3",
      ]);
      expect(result.data[0].waves[0].sets.every((s) => s.isInCollection)).toBe(
        true,
      );
    });

    it("returns empty array when user has no sets in collection", async () => {
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
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.data).toEqual([]);
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
      );

      const result = await service.getCollectionListViewModel("user-123");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].waves[0].sets).toHaveLength(1);
      expect(result.data[0].waves[0].sets[0].catalogNumber).toBe("1");
    });
  });
});
