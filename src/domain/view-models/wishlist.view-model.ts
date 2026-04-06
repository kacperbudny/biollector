import { Wave } from "@/domain/sets";
import type { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";

export type WishlistSectionViewModel = {
  scale: UserWishlistScale;
  label: string;
  sets: SetViewModel[];
};

export class WishlistViewModel {
  constructor(
    public readonly sections: WishlistSectionViewModel[],
    public readonly totalCount: number,
  ) {}

  /**
   * Groups sets that already have a wishlist row into sections by scale (highest numeric first).
   */
  static fromSetViewModels(sets: SetViewModel[]): WishlistViewModel {
    const byScale = new Map<UserWishlistScale, SetViewModel[]>();

    for (const set of sets) {
      if (set.wishlistScale === null) {
        continue;
      }

      const scale = set.wishlistScale;
      const bucket = byScale.get(scale);

      if (bucket) {
        bucket.push(set);
      } else {
        byScale.set(scale, [set]);
      }
    }

    const scalesDescending = Array.from(byScale.keys()).toSorted(
      (a, b) => b - a,
    );

    const sections: WishlistSectionViewModel[] = scalesDescending.map(
      (scale) => ({
        scale,
        label: SetViewModel.getWishlistScaleLabel(scale),
        sets: (byScale.get(scale) ?? []).toSorted(
          WishlistViewModel.compareSetsInSection,
        ),
      }),
    );

    return new WishlistViewModel(sections, sets.length);
  }

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
