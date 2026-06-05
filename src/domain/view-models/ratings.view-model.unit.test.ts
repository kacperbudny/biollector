/** biome-ignore-all lint/style/noNonNullAssertion: it's fine in tests */

import { describe, expect, it } from "vitest";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { Wave } from "@/domain/sets";
import { RatingsViewModel } from "@/domain/view-models/ratings.view-model";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { setFixture } from "@/tests/fixtures";

describe(RatingsViewModel.name, () => {
  describe(`${RatingsViewModel.fromSetViewModels.name}`, () => {
    it("groups sets by rating in descending order", () => {
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
        setFixture({
          catalogNumber: "8593",
          name: "Test C",
          releaseYear: "2003",
          wave: Wave.TOA_MATA,
        }),
      ]);
      const byNumber = new Map(
        setsRepo.getAll().map((set) => [set.catalogNumber, set]),
      );
      const setViewModels = [
        SetViewModel.fromBionicleSet({
          set: byNumber.get("8534")!,
          collectionSetNumbers: [],
          userRatings: { "8534": 5 },
          averageRatings: {},
          userWishlistState: {},
        }),
        SetViewModel.fromBionicleSet({
          set: byNumber.get("1388")!,
          collectionSetNumbers: [],
          userRatings: { "1388": 4 },
          averageRatings: {},
          userWishlistState: {},
        }),
        SetViewModel.fromBionicleSet({
          set: byNumber.get("8593")!,
          collectionSetNumbers: [],
          userRatings: { "8593": 5 },
          averageRatings: {},
          userWishlistState: {},
        }),
      ];

      const vm = RatingsViewModel.fromSetViewModels(setViewModels);

      expect(vm.totalCount).toBe(3);
      expect(vm.sections).toHaveLength(2);
      expect(vm.sections[0].rating).toBe(5);
      expect(vm.sections[0].label).toBe("5 stars");
      expect(vm.sections[0].sets.map((s) => s.catalogNumber)).toEqual([
        "8593",
        "8534",
      ]);
      expect(vm.sections[1].rating).toBe(4);
      expect(vm.sections[1].label).toBe("4 stars");
      expect(vm.sections[1].sets.map((s) => s.catalogNumber)).toEqual(["1388"]);
    });

    it("skips sets without a user rating", () => {
      const setsRepo = new SetsRepository([
        setFixture({
          catalogNumber: "8534",
          name: "Test",
          releaseYear: "2004",
          wave: Wave.TOA_METRU,
        }),
      ]);
      const set = setsRepo.getAll()[0];
      const setViewModels = [
        SetViewModel.fromBionicleSet({
          set,
          collectionSetNumbers: [],
          userRatings: {},
          averageRatings: {},
          userWishlistState: {},
        }),
      ];

      const vm = RatingsViewModel.fromSetViewModels(setViewModels);

      expect(vm.totalCount).toBe(1);
      expect(vm.sections).toHaveLength(0);
    });
  });
});
