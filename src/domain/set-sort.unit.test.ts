import { describe, expect, it } from "vitest";
import { SetSort } from "@/domain/set-sort";
import { SetType, Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";
import type {
  FlatSetSection,
  NestedSetSection,
} from "@/domain/view-models/sets-grouped.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { setViewModelFixture } from "@/tests/fixtures";

describe(SetSort.name, () => {
  const tahu = setViewModelFixture(
    {
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      setType: SetType.CANISTER,
      wave: Wave.TOA_MATA,
    },
    {
      inCollection: true,
      addedToCollectionAt: new Date("2023-01-01T00:00:00Z"),
      userRating: 5,
      averageRating: 4.8,
      wishlistScale: UserWishlistScale.MUST_HAVE,
    },
  );

  const gali = setViewModelFixture(
    {
      catalogNumber: "8533",
      name: "Gali",
      releaseYear: "2001",
      setType: SetType.CANISTER,
      wave: Wave.TOA_MATA,
    },
    {
      inCollection: true,
      addedToCollectionAt: new Date("2023-06-01T00:00:00Z"),
      userRating: 4,
      averageRating: 4.2,
      wishlistScale: UserWishlistScale.HIGH,
    },
  );

  const bohrokVa = setViewModelFixture(
    {
      catalogNumber: "8556",
      name: "Boxor",
      releaseYear: "2002",
      setType: SetType.LARGE,
      wave: Wave.BOHROK,
    },
    {
      inCollection: false,
      averageRating: 3.5,
    },
  );

  const baseVm: SetsListViewModel = {
    sets: [tahu, gali, bohrokVa],
    totalCount: 3,
  };

  describe("year-wave sort", () => {
    it("sorts by year and wave ascending without collection counts when displayCollectionCounts is false", () => {
      const result = new SetSort("year-wave", "asc", false, false).sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual(["2001", "2002"]);
      const sec2001 = result.sections[0] as NestedSetSection;
      expect(sec2001.collectionCount).toBeUndefined();
      expect(sec2001.groups[0].collectionCount).toBeUndefined();
      expect(sec2001.groups[0].sets.map((s) => s.catalogNumber)).toEqual([
        "8533",
        "8534",
      ]);
    });

    it("includes collection counts and completion flags when displayCollectionCounts is true", () => {
      const result = new SetSort("year-wave", "asc", false, true).sort(baseVm);
      const sec2001 = result.sections[0] as NestedSetSection;
      expect(sec2001.collectionCount).toBeDefined();
      expect(sec2001.groups[0].collectionCount).toBeDefined();
    });

    it("sorts by year and wave descending", () => {
      const result = new SetSort("year-wave", "desc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual(["2002", "2001"]);
    });
  });

  describe("year sort", () => {
    it("sorts flat sections by year ascending", () => {
      const result = new SetSort("year", "asc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual(["2001", "2002"]);
      const sec2001 = result.sections[0] as FlatSetSection;
      expect(sec2001.sets.map((s) => s.catalogNumber)).toEqual([
        "8533",
        "8534",
      ]);
    });

    it("sorts flat sections by year descending", () => {
      const result = new SetSort("year", "desc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual(["2002", "2001"]);
    });
  });

  describe("wave sort", () => {
    it("sorts flat sections by wave enum order ascending", () => {
      const result = new SetSort("wave", "asc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        Wave.TOA_MATA,
        Wave.BOHROK,
      ]);
    });

    it("sorts flat sections by wave enum order descending", () => {
      const result = new SetSort("wave", "desc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        Wave.BOHROK,
        Wave.TOA_MATA,
      ]);
    });
  });

  describe("catalog-number sort", () => {
    it("sorts all sets flat by catalog number ascending", () => {
      const result = new SetSort("catalog-number", "asc").sort(baseVm);
      expect(result.sections).toHaveLength(1);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.catalogNumber)).toEqual([
        "8533",
        "8534",
        "8556",
      ]);
    });

    it("sorts catalog numbers numerically rather than lexicographically", () => {
      const set1390 = setViewModelFixture({ catalogNumber: "1390" });
      const set10023 = setViewModelFixture({ catalogNumber: "10023" });
      const vm: SetsListViewModel = {
        sets: [set10023, set1390],
        totalCount: 2,
      };

      const result = new SetSort("catalog-number", "asc").sort(vm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.catalogNumber)).toEqual(["1390", "10023"]);
    });

    it("sorts all sets flat by catalog number descending", () => {
      const result = new SetSort("catalog-number", "desc").sort(baseVm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.catalogNumber)).toEqual([
        "8556",
        "8534",
        "8533",
      ]);
    });
  });

  describe("name sort", () => {
    it("sorts all sets flat by name alphabetically ascending", () => {
      const result = new SetSort("name", "asc").sort(baseVm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.name)).toEqual(["Boxor", "Gali", "Tahu"]);
    });

    it("sorts all sets flat by name alphabetically descending", () => {
      const result = new SetSort("name", "desc").sort(baseVm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.name)).toEqual(["Tahu", "Gali", "Boxor"]);
    });
  });

  describe("set-type sort", () => {
    it("groups by set type ascending", () => {
      const result = new SetSort("set-type", "asc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        SetType.CANISTER,
        SetType.LARGE,
      ]);
    });

    it("groups by set type descending", () => {
      const result = new SetSort("set-type", "desc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        SetType.LARGE,
        SetType.CANISTER,
      ]);
    });
  });

  describe("wishlist-scale sort", () => {
    it("groups by wishlist scale descending regardless of signed-in status", () => {
      const signedIn = new SetSort("wishlist-scale", "desc", true).sort(baseVm);
      const signedOut = new SetSort("wishlist-scale", "desc", false).sort(
        baseVm,
      );
      expect(signedIn.sections.map((s) => s.label)).toEqual([
        "Must have",
        "High priority",
        "Not in wishlist",
      ]);
      expect(signedOut.sections.map((s) => s.label)).toEqual(
        signedIn.sections.map((s) => s.label),
      );
    });
  });

  describe("user-rating sort", () => {
    it("groups by star rating descending (when signed in)", () => {
      const result = new SetSort("user-rating", "desc", true).sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        "5 stars",
        "4 stars",
        "No rating",
      ]);
    });

    it("falls back to year-wave when signed out", () => {
      const result = new SetSort("user-rating", "desc", false).sort(baseVm);
      expect("groups" in result.sections[0]).toBe(true);
    });
  });

  describe("average-rating sort", () => {
    it("groups by rounded average rating descending", () => {
      const result = new SetSort("average-rating", "desc").sort(baseVm);
      expect(result.sections.map((s) => s.label)).toEqual([
        "4 stars",
        "3 stars",
      ]);
      const star4Sec = result.sections[0] as FlatSetSection;
      expect(star4Sec.sets.map((s) => s.catalogNumber)).toEqual([
        "8534",
        "8533",
      ]);
    });
  });

  describe("date-added sort", () => {
    it("sorts collected sets by date added descending, uncollected at end (when signed in)", () => {
      const result = new SetSort("date-added", "desc", true).sort(baseVm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.catalogNumber)).toEqual([
        "8533", // June 2023
        "8534", // Jan 2023
        "8556", // uncollected
      ]);
    });

    it("sorts collected sets by date added ascending, uncollected at end (when signed in)", () => {
      const result = new SetSort("date-added", "asc", true).sort(baseVm);
      const sec = result.sections[0] as FlatSetSection;
      expect(sec.sets.map((s) => s.catalogNumber)).toEqual([
        "8534", // Jan 2023
        "8533", // June 2023
        "8556", // uncollected
      ]);
    });

    it("falls back to year-wave when signed out", () => {
      const result = new SetSort("date-added", "desc", false).sort(baseVm);
      expect("groups" in result.sections[0]).toBe(true);
    });
  });
});
