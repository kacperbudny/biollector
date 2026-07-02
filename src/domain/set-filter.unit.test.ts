import { describe, expect, it } from "vitest";
import type { ReleaseYear, SetFilterState } from "@/domain/set-filter";
import { SetFilter } from "@/domain/set-filter";
import { BionicleCharacter, SetType, Wave } from "@/domain/sets";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { setFixture } from "@/tests/fixtures";

function vm(overrides: Parameters<typeof setFixture>[0]): SetViewModel {
  return SetViewModel.build({
    set: setFixture(overrides),
    collectionSetNumbers: [],
    userRatings: {},
    averageRatings: {},
    userWishlistState: {},
  });
}

const emptyState: SetFilterState = {
  query: "",
  years: [],
  types: [],
  waves: [],
  characters: [],
};

const tahu = vm({
  catalogNumber: "8534",
  name: "Tahu",
  releaseYear: "2001",
  wave: Wave.TOA_MATA,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.TAHU],
});

const gali = vm({
  catalogNumber: "8533",
  name: "Gali",
  releaseYear: "2001",
  wave: Wave.TOA_MATA,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.GALI],
});

const jaller = vm({
  catalogNumber: "8594",
  name: "Jaller Mahri",
  releaseYear: "2007",
  wave: Wave.TOA_MAHRI,
  setType: SetType.CANISTER,
  characters: [BionicleCharacter.JALLER],
});

const playset = vm({
  catalogNumber: "8893",
  name: "Lava Chamber Gate",
  releaseYear: "2006",
  wave: Wave.PIRAKA,
  setType: SetType.PLAYSET,
  minifigures: [{ character: BionicleCharacter.HEWKII }],
});

describe(`${SetFilter.name}.isActive`, () => {
  it("is false when all dimensions are empty", () => {
    expect(new SetFilter(emptyState).isActive).toBe(false);
  });

  it("is true when query is non-empty", () => {
    expect(new SetFilter({ ...emptyState, query: "tahu" }).isActive).toBe(true);
  });

  it("is true when any structured filter is set", () => {
    expect(
      new SetFilter({ ...emptyState, years: ["2001" as ReleaseYear] }).isActive,
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
});

describe(`${SetFilter.name}.matches`, () => {
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
});

describe(`${SetFilter.name}.filter`, () => {
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
    const tahufixed = SetViewModel.build({
      set: setFixture({
        catalogNumber: "8534",
        name: "Tahu",
        releaseYear: "2001",
        wave: Wave.TOA_MATA,
        setType: SetType.CANISTER,
      }),
      collectionSetNumbers: [],
      userRatings: { "8534": 5 },
      averageRatings: {},
      userWishlistState: {},
    });
    const playsetFixed = SetViewModel.build({
      set: setFixture({
        catalogNumber: "8893",
        name: "Lava Chamber Gate",
        releaseYear: "2006",
        wave: Wave.PIRAKA,
        setType: SetType.PLAYSET,
      }),
      collectionSetNumbers: [],
      userRatings: { "8893": 5 },
      averageRatings: {},
      userWishlistState: {},
    });
    const ratingsVm = SetsGroupedViewModel.toRatings([tahufixed, playsetFixed]);
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
