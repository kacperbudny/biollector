import { Wave } from "@/domain/sets";

export type SearchableSet = {
  catalogNumber: string;
  name: string;
  releaseYear: string;
  wave: Wave;
  characters?: readonly string[];
  minifigures?: readonly { character: string }[];
};

const WAVE_ORDER = Object.values(Wave);

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
  private readonly normalizedQuery: string;

  constructor(query: string) {
    this.normalizedQuery = query.trim().toLowerCase();
    this.tokens = this.normalizedQuery.split(/\s+/).filter((t) => t.length > 0);
  }

  get isEmpty(): boolean {
    return this.tokens.length === 0;
  }

  matches(set: SearchableSet): boolean {
    if (this.isEmpty) {
      return true;
    }

    const fields = this.searchableFields(set);

    return this.tokens.every((token) =>
      fields.some((field) => field.includes(token)),
    );
  }

  compare(a: SearchableSet, b: SearchableSet): number {
    const rankDiff = this.rank(a) - this.rank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const yearA = Number.parseInt(a.releaseYear, 10);
    const yearB = Number.parseInt(b.releaseYear, 10);
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    const waveA = WAVE_ORDER.indexOf(a.wave);
    const waveB = WAVE_ORDER.indexOf(b.wave);
    if (waveA !== waveB) {
      return waveA - waveB;
    }

    return a.catalogNumber.localeCompare(b.catalogNumber, undefined, {
      numeric: true,
    });
  }

  private rank(set: SearchableSet): number {
    if (set.catalogNumber.toLowerCase() === this.normalizedQuery) {
      return 0;
    }

    const name = set.name.toLowerCase();
    if (name.startsWith(this.normalizedQuery)) {
      return 1;
    }

    if (this.tokens.every((token) => name.includes(token))) {
      return 2;
    }

    return 3;
  }

  private searchableFields(set: SearchableSet): string[] {
    return [
      set.name,
      set.catalogNumber,
      set.releaseYear,
      set.wave,
      ...(set.characters ?? []),
      ...(set.minifigures?.map((m) => m.character) ?? []),
    ].map((f) => f.toLowerCase());
  }
}
