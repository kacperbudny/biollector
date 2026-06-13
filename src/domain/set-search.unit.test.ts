import { describe, expect, it } from "vitest";
import { SetSearch } from "@/domain/set-search";
import { BionicleCharacter, Wave } from "@/domain/sets";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { setFixture } from "@/tests/fixtures";

function getSetViewModel(
  overrides: Parameters<typeof setFixture>[0] & { userRating?: number },
): SetViewModel {
  return SetViewModel.build({
    set: setFixture(overrides),
    collectionSetNumbers: [],
    userRatings:
      overrides.userRating != null
        ? { [overrides.catalogNumber]: overrides.userRating }
        : {},
    averageRatings: {},
    userWishlistState: {},
  });
}

describe(`${SetSearch.name}.matches`, () => {
  it("returns true for empty query", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    });
    expect(new SetSearch("").matches(set)).toBe(true);
    expect(new SetSearch("   ").matches(set)).toBe(true);
  });

  it("matches by name (case-insensitive)", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu Nuva",
      releaseYear: "2002",
      wave: Wave.TOA_NUVA,
    });
    expect(new SetSearch("tahu").matches(set)).toBe(true);
    expect(new SetSearch("NUVA").matches(set)).toBe(true);
    expect(new SetSearch("gali").matches(set)).toBe(false);
  });

  it("matches by catalog number", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    });
    expect(new SetSearch("8534").matches(set)).toBe(true);
    expect(new SetSearch("853").matches(set)).toBe(true);
    expect(new SetSearch("9999").matches(set)).toBe(false);
  });

  it("matches by release year", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    });
    expect(new SetSearch("2001").matches(set)).toBe(true);
    expect(new SetSearch("2002").matches(set)).toBe(false);
  });

  it("matches by wave", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    });
    expect(new SetSearch("toa mata").matches(set)).toBe(true);
    expect(new SetSearch("mata").matches(set)).toBe(true);
  });

  it("requires ALL tokens to match (AND logic across fields)", () => {
    const set = getSetViewModel({
      catalogNumber: "8594",
      name: "Jaller",
      releaseYear: "2007",
      wave: Wave.TOA_MAHRI,
    });
    expect(new SetSearch("jaller mahri").matches(set)).toBe(true);
    expect(new SetSearch("jaller nuva").matches(set)).toBe(false);
  });

  it("each token can match a different field", () => {
    const set = getSetViewModel({
      catalogNumber: "8594",
      name: "Jaller",
      releaseYear: "2007",
      wave: Wave.TOA_MAHRI,
    });
    expect(new SetSearch("8594 mahri").matches(set)).toBe(true);
    expect(new SetSearch("2007 jaller").matches(set)).toBe(true);
  });

  it("matches by character name", () => {
    const set = getSetViewModel({
      catalogNumber: "8594",
      name: "Jaller Mahri",
      releaseYear: "2007",
      wave: Wave.TOA_MAHRI,
      characters: [BionicleCharacter.JALLER],
    });
    expect(new SetSearch("jaller").matches(set)).toBe(true);
    expect(new SetSearch("tahu").matches(set)).toBe(false);
  });

  it("matches by minifigure character name", () => {
    const set = getSetViewModel({
      catalogNumber: "8594",
      name: "Some Playset",
      releaseYear: "2007",
      wave: Wave.TOA_MAHRI,
      minifigures: [{ character: "Jaller" as BionicleCharacter }],
    });
    expect(new SetSearch("jaller").matches(set)).toBe(true);
    expect(new SetSearch("tahu").matches(set)).toBe(false);
  });

  it("returns false when set has no characters or minifigures and query does not match other fields", () => {
    const set = getSetViewModel({
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    });
    expect(new SetSearch("jaller").matches(set)).toBe(false);
  });
});

describe(`${SetSearch.name}.filter`, () => {
  const jaller = getSetViewModel({
    catalogNumber: "8594",
    name: "Jaller",
    releaseYear: "2007",
    wave: Wave.TOA_MAHRI,
    userRating: 5,
  });
  const tahu = getSetViewModel({
    catalogNumber: "8534",
    name: "Tahu",
    releaseYear: "2001",
    wave: Wave.TOA_MATA,
    userRating: 4,
  });
  const gali = getSetViewModel({
    catalogNumber: "8533",
    name: "Gali",
    releaseYear: "2001",
    wave: Wave.TOA_MATA,
    userRating: 5,
  });

  it("returns the same view model when query is empty", () => {
    const vm = SetsGroupedViewModel.groupedByYearAndWave([jaller, tahu]);
    const result = new SetSearch("").filter(vm);
    expect(result).toBe(vm);
  });

  it("filters sets within NestedSetSections", () => {
    const vm = SetsGroupedViewModel.groupedByYearAndWave([jaller, tahu, gali]);
    const result = new SetSearch("jaller").filter(vm);

    expect(result.totalCount).toBe(1);
    expect(result.sections).toHaveLength(1);
    const section = result.sections[0];
    expect(section.label).toBe("2007");
    if (!("groups" in section)) {
      throw new Error("Expected NestedSetSection");
    }
    expect(section.groups[0].sets).toHaveLength(1);
    expect(section.groups[0].sets[0].catalogNumber).toBe("8594");
  });

  it("removes empty groups and sections after filtering", () => {
    const vm = SetsGroupedViewModel.groupedByYearAndWave([tahu, gali]);
    const result = new SetSearch("tahu").filter(vm);

    expect(result.sections).toHaveLength(1);
    const section = result.sections[0];
    if (!("groups" in section)) {
      throw new Error("Expected NestedSetSection");
    }
    expect(section.groups).toHaveLength(1);
    expect(section.groups[0].sets).toHaveLength(1);
  });

  it("filters sets within FlatSetSections", () => {
    const vm = SetsGroupedViewModel.toRatings([jaller, tahu, gali]);
    const result = new SetSearch("jaller").filter(vm);

    expect(result.totalCount).toBe(1);
    expect(result.sections).toHaveLength(1);
    const section = result.sections[0];
    if (!("sets" in section)) {
      throw new Error("Expected FlatSetSection");
    }
    expect(section.sets[0].catalogNumber).toBe("8594");
  });

  it("clears collectionCount and isComplete on NestedSetSections", () => {
    const vm = SetsGroupedViewModel.toCollection(
      [tahu, gali],
      [
        setFixture({
          catalogNumber: "8534",
          name: "Tahu",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "8533",
          name: "Gali",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
        setFixture({
          catalogNumber: "1388",
          name: "Other",
          releaseYear: "2001",
          wave: Wave.TOA_MATA,
        }),
      ],
    );
    const result = new SetSearch("tahu").filter(vm);

    const section = result.sections[0];
    if (!("groups" in section)) {
      throw new Error("Expected NestedSetSection");
    }
    expect(section.collectionCount).toBeUndefined();
    expect(section.isComplete).toBeUndefined();
    expect(section.groups[0].collectionCount).toBeUndefined();
    expect(section.groups[0].isComplete).toBeUndefined();
  });

  it("returns zero sections when nothing matches", () => {
    const vm = SetsGroupedViewModel.groupedByYearAndWave([tahu, gali]);
    const result = new SetSearch("xyzzy").filter(vm);
    expect(result.sections).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});
