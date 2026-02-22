import { describe, expect, it } from "vitest";
import { type BionicleSet, SetType, Wave } from "@/data/sets";
import { getSetsListViewModel } from "@/services/sets.service";

const createMockSet = (
  overrides: Partial<BionicleSet> &
    Pick<BionicleSet, "catalogNumber" | "name" | "releaseYear" | "wave">,
): BionicleSet => ({
  setType: SetType.CANISTER,
  imageName: "test.png",
  ...overrides,
});

describe("getSetsListViewModel", () => {
  it("returns years in ascending order", () => {
    const sets: BionicleSet[] = [
      createMockSet({
        catalogNumber: "1",
        name: "A",
        releaseYear: "2006",
        wave: Wave.TOA_INIKA,
      }),
      createMockSet({
        catalogNumber: "2",
        name: "B",
        releaseYear: "2001",
        wave: Wave.TOA_MATA,
      }),
    ];

    const result = getSetsListViewModel(sets);

    expect(result.map((r) => r.year)).toEqual(["2001", "2006"]);
  });

  it("groups sets by year and wave according to WAVE_ORDER", () => {
    const sets: BionicleSet[] = [
      createMockSet({
        catalogNumber: "1",
        name: "Toa",
        releaseYear: "2001",
        wave: Wave.TOA_MATA,
      }),
      createMockSet({
        catalogNumber: "2",
        name: "Tohunga",
        releaseYear: "2001",
        wave: Wave.TOHUNGA,
      }),
    ];

    const result = getSetsListViewModel(sets);

    expect(result).toHaveLength(1);
    expect(result[0].year).toBe("2001");
    expect(result[0].waves.map((w) => w.wave)).toEqual([
      Wave.TOHUNGA,
      Wave.TOA_MATA,
    ]);
    expect(result[0].waves[0].sets).toHaveLength(1);
    expect(result[0].waves[0].sets[0].name).toBe("Tohunga");
    expect(result[0].waves[1].sets).toHaveLength(1);
    expect(result[0].waves[1].sets[0].name).toBe("Toa");
  });

  it("returns empty array for empty input", () => {
    const result = getSetsListViewModel([]);
    expect(result).toEqual([]);
  });
});
