import { SetSearch } from "@/domain/set-search";
import type { BionicleCharacter, SetType, Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type {
  FlatSetSection,
  NestedSetSection,
  SetSection,
  SetsGroupedViewModel,
} from "@/domain/view-models/sets-grouped.view-model";

export const RELEASE_YEARS = [
  "2001",
  "2002",
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
  "2010",
  "2015",
  "2016",
  "2022",
  "2023",
  "2026",
] as const;

export type ReleaseYear = (typeof RELEASE_YEARS)[number];

export type SetFilterState = {
  query: string;
  years: ReleaseYear[];
  types: SetType[];
  waves: Wave[];
  characters: BionicleCharacter[];
};

/**
 * Filters sets by a combination of free-text query and structured dimensions.
 *
 * All active dimensions are ANDed together:
 *   text query AND years AND types AND waves AND characters
 *
 * Within each structured dimension, OR logic applies — a set matches if it
 * satisfies at least one of the selected values. An empty array for any
 * dimension means "no filter on that dimension" (matches everything).
 *
 * Instantiate with a SetFilterState; a fully empty state matches everything.
 */
export class SetFilter {
  private readonly textSearch: SetSearch;
  private readonly state: SetFilterState;

  constructor(state: SetFilterState) {
    this.state = state;
    this.textSearch = new SetSearch(state.query);
  }

  get isActive(): boolean {
    return (
      this.state.query.trim().length > 0 ||
      this.state.years.length > 0 ||
      this.state.types.length > 0 ||
      this.state.waves.length > 0 ||
      this.state.characters.length > 0
    );
  }

  matches(set: SetViewModel): boolean {
    if (!this.textSearch.matches(set)) {
      return false;
    }

    const { years, types, waves, characters } = this.state;

    if (years.length > 0 && !years.includes(set.releaseYear as ReleaseYear)) {
      return false;
    }
    if (types.length > 0 && !types.includes(set.setType)) {
      return false;
    }
    if (waves.length > 0 && !waves.includes(set.wave)) {
      return false;
    }

    if (characters.length > 0) {
      const setCharacters = [
        ...(set.characters ?? []),
        ...(set.minifigures?.map((m) => m.character) ?? []),
      ];
      if (!characters.some((c) => setCharacters.includes(c))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a filtered copy of the view model containing only matching sets.
   * Empty sections/groups are removed. Collection completion metadata
   * (collectionCount, isComplete) is cleared on NestedSetSections because it
   * becomes misleading under an active filter.
   */
  filter(vm: SetsGroupedViewModel): SetsGroupedViewModel {
    if (!this.isActive) {
      return vm;
    }

    const filteredSections = vm.sections
      .map((section) =>
        "groups" in section
          ? this.filterNestedSection(section)
          : this.filterFlatSection(section),
      )
      .filter((section): section is SetSection => section !== null);

    const totalCount = filteredSections.reduce(
      (sum, section) =>
        "groups" in section
          ? sum + section.groups.reduce((gs, g) => gs + g.sets.length, 0)
          : sum + section.sets.length,
      0,
    );

    return { sections: filteredSections, totalCount };
  }

  private filterNestedSection(
    section: NestedSetSection,
  ): NestedSetSection | null {
    const groups = section.groups
      .map((group) => ({
        label: group.label,
        sets: group.sets.filter((set) => this.matches(set)),
      }))
      .filter((group) => group.sets.length > 0);

    if (groups.length === 0) {
      return null;
    }

    return { label: section.label, groups };
  }

  private filterFlatSection(section: FlatSetSection): FlatSetSection | null {
    const sets = section.sets.filter((set) => this.matches(set));

    if (sets.length === 0) {
      return null;
    }

    return { label: section.label, sets };
  }
}
