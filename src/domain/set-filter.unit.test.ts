import { describe, expect, it } from "vitest";
import {
  type ReleaseYear,
  SetFilter,
  type SetFilterState,
} from "@/domain/set-filter";
import { BionicleCharacter, SetType, Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { setViewModelFixture } from "@/tests/fixtures";

const emptyState: SetFilterState = {
  query: "",
  years: [],
  types: [],
  waves: [],
  characters: [],
  collection: null,
  wishlist: [],
  userRatings: [],
  averageRatings: [],
};

const tahu = setViewModelFixture({
  catalogNumber: "8534",
  name: "Tahu",
  releaseYear: "2001",
  wave: Wave.TOA_MATA,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.TAHU],
});

const gali = setViewModelFixture({
  catalogNumber: "8533",
  name: "Gali",
  releaseYear: "2001",
  wave: Wave.TOA_MATA,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.GALI],
});

const jaller = setViewModelFixture({
  catalogNumber: "8594",
  name: "Jaller Mahri",
  releaseYear: "2007",
  wave: Wave.TOA_MAHRI,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.JALLER],
});

const playset = setViewModelFixture({
  catalogNumber: "8893",
  name: "Lava Chamber Gate",
  releaseYear: "2006",
  wave: Wave.PIRAKA,
  setType: SetType.PLAYSET,
  minifigures: [{ character: BionicleCharacter.HEWKII }],
});

describe(SetFilter.name, () => {
  describe("isActive", () => {
    it("is false when all dimensions are empty", () => {
      expect(new SetFilter(emptyState).isActive).toBe(false);
    });

    it("is true when query is non-empty", () => {
      expect(new SetFilter({ ...emptyState, query: "tahu" }).isActive).toBe(
        true,
      );
    });

    it("is true when any structured filter is set", () => {
      expect(
        new SetFilter({ ...emptyState, years: ["2001" as ReleaseYear] })
          .isActive,
      ).toBe(true);
      expect(
        new SetFilter({ ...emptyState, types: [SetType.CANISTER] }).isActive,
      ).toBe(true);
      expect(
        new SetFilter({ ...emptyState, waves: [Wave.TOA_MATA] }).isActive,
      ).toBe(true);
      expect(
        new SetFilter({ ...emptyState, characters: [BionicleCharacter.TAHU] })
          .isActive,
      ).toBe(true);
    });

    it("is true when any user-specific filter is set", () => {
      expect(new SetFilter({ ...emptyState, collection: "in" }).isActive).toBe(
        true,
      );
      expect(new SetFilter({ ...emptyState, wishlist: ["5"] }).isActive).toBe(
        true,
      );
      expect(
        new SetFilter({ ...emptyState, userRatings: ["3"] }).isActive,
      ).toBe(true);
      expect(
        new SetFilter({ ...emptyState, averageRatings: ["4"] }).isActive,
      ).toBe(true);
    });
  });

  describe("matches", () => {
    it("matches everything when state is fully empty", () => {
      const filter = new SetFilter(emptyState);
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(jaller)).toBe(true);
    });

    it("applies text query (delegates to SetSearch)", () => {
      const filter = new SetFilter({ ...emptyState, query: "tahu" });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(gali)).toBe(false);
    });

    it("filters by release year (OR within dimension)", () => {
      const filter = new SetFilter({
        ...emptyState,
        years: ["2001" as ReleaseYear],
      });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(gali)).toBe(true);
      expect(filter.matches(jaller)).toBe(false);
    });

    it("matches when any selected year matches (OR logic)", () => {
      const filter = new SetFilter({
        ...emptyState,
        years: ["2001" as ReleaseYear, "2007" as ReleaseYear],
      });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(jaller)).toBe(true);
      expect(filter.matches(playset)).toBe(false);
    });

    it("filters by set type", () => {
      const filter = new SetFilter({ ...emptyState, types: [SetType.PLAYSET] });
      expect(filter.matches(playset)).toBe(true);
      expect(filter.matches(tahu)).toBe(false);
      expect(filter.matches(jaller)).toBe(false);
    });

    it("filters by wave", () => {
      const filter = new SetFilter({ ...emptyState, waves: [Wave.TOA_MAHRI] });
      expect(filter.matches(jaller)).toBe(true);
      expect(filter.matches(tahu)).toBe(false);
    });

    it("matches characters in characters array", () => {
      const filter = new SetFilter({
        ...emptyState,
        characters: [BionicleCharacter.TAHU],
      });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(gali)).toBe(false);
    });

    it("matches characters in minifigures array", () => {
      const filter = new SetFilter({
        ...emptyState,
        characters: [BionicleCharacter.HEWKII],
      });
      expect(filter.matches(playset)).toBe(true);
      expect(filter.matches(tahu)).toBe(false);
    });

    it("applies character OR logic — matches if any selected character is present", () => {
      const filter = new SetFilter({
        ...emptyState,
        characters: [BionicleCharacter.TAHU, BionicleCharacter.GALI],
      });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(gali)).toBe(true);
      expect(filter.matches(jaller)).toBe(false);
    });

    it("applies AND logic across multiple filter dimensions", () => {
      const filter = new SetFilter({
        ...emptyState,
        years: ["2001" as ReleaseYear],
        types: [SetType.CANISTER],
        waves: [Wave.TOA_MATA],
        characters: [BionicleCharacter.TAHU],
      });
      expect(filter.matches(tahu)).toBe(true);
      expect(filter.matches(gali)).toBe(false); // wrong character
      expect(filter.matches(jaller)).toBe(false); // wrong year/wave
    });

    it("combines text query AND structured filters", () => {
      const filter = new SetFilter({
        ...emptyState,
        query: "gali",
        years: ["2001" as ReleaseYear],
      });
      expect(filter.matches(gali)).toBe(true);
      expect(filter.matches(tahu)).toBe(false); // name doesn't match query
      expect(filter.matches(jaller)).toBe(false); // year doesn't match
    });

    describe("signed in user filters", () => {
      const owned = setViewModelFixture(
        { catalogNumber: "1", name: "Owned" },
        { inCollection: true },
      );
      const notOwned = setViewModelFixture({
        catalogNumber: "2",
        name: "Not owned",
      });

      it("filters by collection membership", () => {
        const inFilter = new SetFilter({ ...emptyState, collection: "in" });
        expect(inFilter.matches(owned)).toBe(true);
        expect(inFilter.matches(notOwned)).toBe(false);

        const notInFilter = new SetFilter({
          ...emptyState,
          collection: "not-in",
        });
        expect(notInFilter.matches(owned)).toBe(false);
        expect(notInFilter.matches(notOwned)).toBe(true);
      });

      it("filters by wishlist scale and 'not in wishlist' (OR within dimension)", () => {
        const mustHave = setViewModelFixture(
          { catalogNumber: "1" },
          { wishlistScale: UserWishlistScale.MUST_HAVE },
        );
        const notInterested = setViewModelFixture(
          { catalogNumber: "2" },
          { wishlistScale: UserWishlistScale.NOT_INTERESTED },
        );
        const notInWishlist = setViewModelFixture({ catalogNumber: "3" });

        const filter = new SetFilter({
          ...emptyState,
          wishlist: ["5", "none"],
        });
        expect(filter.matches(mustHave)).toBe(true);
        expect(filter.matches(notInWishlist)).toBe(true);
        expect(filter.matches(notInterested)).toBe(false);

        const notInterestedFilter = new SetFilter({
          ...emptyState,
          wishlist: ["0"],
        });
        expect(notInterestedFilter.matches(notInterested)).toBe(true);
        expect(notInterestedFilter.matches(mustHave)).toBe(false);
      });

      it("filters by user rating and 'no rating'", () => {
        const ratedThree = setViewModelFixture(
          { catalogNumber: "1" },
          { userRating: 3 },
        );
        const ratedFive = setViewModelFixture(
          { catalogNumber: "2" },
          { userRating: 5 },
        );
        const unrated = setViewModelFixture({ catalogNumber: "3" });

        const filter = new SetFilter({
          ...emptyState,
          userRatings: ["3", "none"],
        });
        expect(filter.matches(ratedThree)).toBe(true);
        expect(filter.matches(unrated)).toBe(true);
        expect(filter.matches(ratedFive)).toBe(false);
      });

      it("filters by floored average rating buckets", () => {
        const avgThreePointFive = setViewModelFixture(
          { catalogNumber: "1" },
          { averageRating: 3.54 },
        );
        const avgFourPointNine = setViewModelFixture(
          { catalogNumber: "2" },
          { averageRating: 4.9 },
        );
        const avgExactlyFive = setViewModelFixture(
          { catalogNumber: "3" },
          { averageRating: 5 },
        );
        const noAverage = setViewModelFixture({ catalogNumber: "4" });

        const threeBucket = new SetFilter({
          ...emptyState,
          averageRatings: ["3"],
        });
        expect(threeBucket.matches(avgThreePointFive)).toBe(true);
        expect(threeBucket.matches(avgFourPointNine)).toBe(false);

        const fiveBucket = new SetFilter({
          ...emptyState,
          averageRatings: ["5"],
        });
        expect(fiveBucket.matches(avgExactlyFive)).toBe(true);
        expect(fiveBucket.matches(avgFourPointNine)).toBe(false);

        const noneBucket = new SetFilter({
          ...emptyState,
          averageRatings: ["none"],
        });
        expect(noneBucket.matches(noAverage)).toBe(true);
        expect(noneBucket.matches(avgExactlyFive)).toBe(false);
      });

      it("applies AND logic across user-specific and structured dimensions", () => {
        const match = setViewModelFixture(
          { catalogNumber: "1", releaseYear: "2001" },
          { inCollection: true, userRating: 5 },
        );
        const wrongRating = setViewModelFixture(
          { catalogNumber: "2", releaseYear: "2001" },
          { inCollection: true, userRating: 3 },
        );

        const filter = new SetFilter({
          ...emptyState,
          years: ["2001" as ReleaseYear],
          collection: "in",
          userRatings: ["5"],
        });
        expect(filter.matches(match)).toBe(true);
        expect(filter.matches(wrongRating)).toBe(false);
      });
    });
  });

  describe("filter", () => {
    it("returns the same view model when state is fully empty", () => {
      const groupedVm = SetsGroupedViewModel.groupedByYearAndWave([
        tahu,
        gali,
        jaller,
      ]);
      const filter = new SetFilter(emptyState);
      expect(filter.filter(groupedVm)).toBe(groupedVm);
    });

    it("filters NestedSetSections by year and removes empty groups", () => {
      const groupedVm = SetsGroupedViewModel.groupedByYearAndWave([
        tahu,
        gali,
        jaller,
      ]);
      const result = new SetFilter({
        ...emptyState,
        years: ["2007" as ReleaseYear],
      }).filter(groupedVm);

      expect(result.totalCount).toBe(1);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].label).toBe("2007");
    });

    it("filters FlatSetSections by set type", () => {
      const tahuRated = setViewModelFixture(
        {
          catalogNumber: "8534",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
          setType: SetType.CANISTER,
        },
        { userRating: 5 },
      );
      const playsetRated = setViewModelFixture(
        {
          catalogNumber: "8893",
          name: "Lava Chamber Gate",
          releaseYear: "2006",
          wave: Wave.PIRAKA,
          setType: SetType.PLAYSET,
        },
        { userRating: 5 },
      );
      const ratingsVm = SetsGroupedViewModel.toRatings([
        tahuRated,
        playsetRated,
      ]);
      const result = new SetFilter({
        ...emptyState,
        types: [SetType.PLAYSET],
      }).filter(ratingsVm);

      expect(result.totalCount).toBe(1);
      const section = result.sections[0];
      if (!("sets" in section)) {
        throw new Error("Expected FlatSetSection");
      }
      expect(section.sets[0].catalogNumber).toBe("8893");
    });

    it("returns zero sections when nothing matches", () => {
      const groupedVm = SetsGroupedViewModel.groupedByYearAndWave([tahu, gali]);
      const result = new SetFilter({ ...emptyState, years: ["2026"] }).filter(
        groupedVm,
      );

      expect(result.sections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });
});
