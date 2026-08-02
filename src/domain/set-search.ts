import type { SetViewModel } from "@/domain/view-models/set.view-model";

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
}
