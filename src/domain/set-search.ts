import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type {
  FlatSetSection,
  NestedSetSection,
  SetSection,
  SetsGroupedViewModel,
} from "@/domain/view-models/sets-grouped.view-model";

/**
 * Filters sets by a free-text query.
 *
 * Every whitespace-separated token must appear (case-insensitive substring)
 * in at least one of a set's searchable fields: name, catalogNumber,
 * releaseYear, wave, characters, and minifigure characters.
 *
 * Instantiate with the raw query string; an empty query matches everything.
 */
export class SetSearch {
  private readonly tokens: string[];

  constructor(query: string) {
    this.tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  matches(set: SetViewModel): boolean {
    if (this.tokens.length === 0) {
      return true;
    }

    const fields = [
      set.name,
      set.catalogNumber,
      set.releaseYear,
      set.wave,
      ...(set.characters ?? []),
      ...(set.minifigures?.map((m) => m.character) ?? []),
    ].map((f) => f.toLowerCase());

    return this.tokens.every((token) =>
      fields.some((field) => field.includes(token)),
    );
  }

  /**
   * Returns a filtered copy of the view model containing only matching sets.
   * Empty sections/groups are removed. Collection completion metadata
   * (collectionCount, isComplete) is cleared on NestedSetSections because it
   * becomes misleading under an active filter.
   */
  filter(vm: SetsGroupedViewModel): SetsGroupedViewModel {
    if (this.tokens.length === 0) {
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
