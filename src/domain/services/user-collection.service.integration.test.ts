import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { UserCollectionRepository } from "@/data/repositories/user-collection.repository";
import { UserCollectionService } from "@/domain/services/user-collection.service";
import { truncateTestDb } from "@/tests/db";
import {
  getIntegrationUserCollectionRepository,
  getIntegrationUserCollectionService,
} from "@/tests/integration";

describe(UserCollectionService.name, () => {
  let userCollectionRepository: UserCollectionRepository;
  let userCollectionService: UserCollectionService;

  beforeAll(() => {
    userCollectionRepository = getIntegrationUserCollectionRepository();
    userCollectionService = getIntegrationUserCollectionService();
  });

  afterEach(async () => {
    await truncateTestDb();
  });

  describe(`${UserCollectionService.prototype.getCollectionsCount.name}`, () => {
    it("returns the number of users with at least one set in collection", async () => {
      await userCollectionRepository.insert("u1", "1388");
      await userCollectionRepository.insert("u2", "1389");
      await userCollectionRepository.insert("u1", "1389");
      expect(await userCollectionService.getCollectionsCount()).toBe(2);
    });
  });

  describe(`${UserCollectionService.prototype.toggleSet.name}`, () => {
    it("adds the set when not already in collection", async () => {
      await userCollectionService.toggleSet("user-123", "8534");
      expect(
        await userCollectionRepository.getUserCollection("user-123"),
      ).toContain("8534");
    });

    it("removes the set when already in collection", async () => {
      await userCollectionRepository.insert("user-123", "8534");
      await userCollectionService.toggleSet("user-123", "8534");
      expect(
        await userCollectionRepository.getUserCollection("user-123"),
      ).not.toContain("8534");
    });
  });

  describe(`${UserCollectionService.prototype.getCollectionListViewModel.name}`, () => {
    it("returns a collection view for the user sets", async () => {
      await userCollectionRepository.insert("user-123", "8534");
      const vm =
        await userCollectionService.getCollectionListViewModel("user-123");
      expect(vm.collectionCount).toBe(1);
      const collected = vm.data.flatMap((y) => y.waves.flatMap((w) => w.sets));
      expect(collected.map((s) => s.catalogNumber)).toEqual(["8534"]);
    });
  });
});
