import { describe, expect, it, vi } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { type BionicleSet, Wave } from "@/data/sets";
import { UserCollectionService } from "@/services/user-collection.service";
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

  describe(`${UserCollectionService.prototype.getSetsForUser.name}`, () => {
    it("returns only sets from user collection", async () => {
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

      const result = await service.getSetsForUser("user-123");

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.catalogNumber)).toEqual(["1", "3"]);
      expect(result.every((s) => s.isInCollection)).toBe(true);
      expect(result[0].name).toBe("Tahu");
      expect(result[1].name).toBe("Lewa");
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

      const result = await service.getSetsForUser("user-123");

      expect(result).toEqual([]);
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

      const result = await service.getSetsForUser("user-123");

      expect(result).toHaveLength(1);
      expect(result[0].catalogNumber).toBe("1");
    });
  });
});
