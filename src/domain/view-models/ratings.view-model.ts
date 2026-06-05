import { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type RatingsSectionViewModel = {
  rating: number;
  label: string;
  sets: SetViewModel[];
};

export class RatingsViewModel {
  constructor(
    public readonly sections: RatingsSectionViewModel[],
    public readonly totalCount: number,
  ) {}

  /**
   * Groups sets that have a user rating into sections by star count (highest first).
   */
  static fromSetViewModels(sets: SetViewModel[]): RatingsViewModel {
    const byRating = new Map<number, SetViewModel[]>();

    for (const set of sets) {
      if (set.userRating === undefined) {
        continue;
      }

      const rating = set.userRating;
      const bucket = byRating.get(rating);

      if (bucket) {
        bucket.push(set);
      } else {
        byRating.set(rating, [set]);
      }
    }

    const ratingsDescending = Array.from(byRating.keys()).toSorted(
      (a, b) => b - a,
    );

    const sections: RatingsSectionViewModel[] = ratingsDescending.map(
      (rating) => ({
        rating,
        label: RatingsViewModel.getRatingLabel(rating),
        sets: (byRating.get(rating) ?? []).toSorted(
          RatingsViewModel.compareSetsInSection,
        ),
      }),
    );

    return new RatingsViewModel(sections, sets.length);
  }

  static getRatingLabel(rating: number): string {
    return `${rating} star${rating !== 1 ? "s" : ""}`;
  }

  // sorts sets in a section by year, wave, and catalog number (ascending)
  private static compareSetsInSection(
    a: SetViewModel,
    b: SetViewModel,
  ): number {
    const yearA = Number.parseInt(a.releaseYear, 10);
    const yearB = Number.parseInt(b.releaseYear, 10);
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    const waveA = Object.values(Wave).indexOf(a.wave);
    const waveB = Object.values(Wave).indexOf(b.wave);
    if (waveA !== waveB) {
      return waveA - waveB;
    }
    return a.catalogNumber.localeCompare(b.catalogNumber);
  }
}
