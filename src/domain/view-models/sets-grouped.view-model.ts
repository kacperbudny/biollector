import type { BionicleSet } from "@/domain/sets";
import { Wave } from "@/domain/sets";
import {
  getWishlistScaleLabel,
  type UserWishlistScale,
} from "@/domain/user-wishlist";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type SetGroup = {
  label: string;
  sets: SetViewModel[];
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

export type FlatSetSection = {
  label: string;
  sets: SetViewModel[];
};

export type NestedSetSection = {
  label: string;
  groups: SetGroup[];
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

export type SetSection = FlatSetSection | NestedSetSection;

export type SetsGroupedViewModel = {
  sections: SetSection[];
  totalCount: number;
  collectionCount?: number;
};

export namespace SetsGroupedViewModel {
  export function groupedByYearAndWave(
    sets: SetViewModel[],
  ): SetsGroupedViewModel {
    const grouped = groupByYearAndWave(sets);
    const years = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

    const sections: NestedSetSection[] = years.map((year) => {
      const yearSets = grouped[year];
      const waves = sortedWaves(yearSets);

      const groups: SetGroup[] = waves.map((wave) => ({
        label: wave,
        sets: yearSets[wave] ?? [],
        totalCount: (yearSets[wave] ?? []).length,
      }));

      return {
        label: year,
        groups,
        totalCount: groups.reduce((s, g) => s + g.sets.length, 0),
      };
    });

    return { sections, totalCount: sets.length };
  }

  /** Collection sets grouped by year → wave, enriched with totals from the full catalog. */
  export function toCollection(
    collectionSets: SetViewModel[],
    allSets: BionicleSet[],
  ): SetsGroupedViewModel {
    const base = groupedByYearAndWave(collectionSets);
    const catalogTotals = countByYearAndWave(allSets);
    const allTotalCount = allSets.length;

    const sections: NestedSetSection[] = (
      base.sections as NestedSetSection[]
    ).map((yearSection) => {
      const yearTotals = catalogTotals[yearSection.label] ?? {};
      const yearTotalCount = Object.values(yearTotals).reduce(
        (sum, count) => sum + count,
        0,
      );
      const yearCollectionCount =
        yearSection.totalCount ??
        yearSection.groups.reduce((sum, group) => sum + group.sets.length, 0);

      const waves: SetGroup[] = yearSection.groups.map((waveGroup) => {
        const waveTotalCount = yearTotals[waveGroup.label as Wave] ?? 0;
        const waveCollectionCount = waveGroup.sets.length;

        return {
          ...waveGroup,
          totalCount: waveTotalCount,
          collectionCount: waveCollectionCount,
          isComplete: waveTotalCount === waveCollectionCount,
        };
      });

      return {
        ...yearSection,
        groups: waves,
        totalCount: yearTotalCount,
        collectionCount: yearCollectionCount,
        isComplete: yearTotalCount === yearCollectionCount,
      };
    });

    return {
      sections,
      totalCount: allTotalCount,
      collectionCount: collectionSets.length,
    };
  }

  /** Wishlisted sets grouped by scale (highest first), sorted within each section by year → wave → catalog number. */
  export function toWishlist(sets: SetViewModel[]): SetsGroupedViewModel {
    const byScale = new Map<UserWishlistScale, SetViewModel[]>();

    for (const set of sets) {
      if (set.wishlistScale === null) {
        continue;
      }

      const bucket = byScale.get(set.wishlistScale) ?? [];
      bucket.push(set);
      byScale.set(set.wishlistScale, bucket);
    }

    const scalesDescending = Array.from(byScale.keys()).sort((a, b) => b - a);

    const sections: FlatSetSection[] = scalesDescending.map((scale) => ({
      label: getWishlistScaleLabel(scale),
      sets: (byScale.get(scale) ?? []).sort(compareSets),
    }));

    return { sections, totalCount: sets.length };
  }

  /** Rated sets grouped by star rating (highest first), sorted within each section by year → wave → catalog number. */
  export function toRatings(sets: SetViewModel[]): SetsGroupedViewModel {
    const byRating = new Map<number, SetViewModel[]>();
    for (const set of sets) {
      if (set.userRating === undefined) {
        continue;
      }
      const bucket = byRating.get(set.userRating) ?? [];
      bucket.push(set);
      byRating.set(set.userRating, bucket);
    }

    const ratingsDescending = Array.from(byRating.keys()).sort((a, b) => b - a);

    const sections: FlatSetSection[] = ratingsDescending.map((rating) => ({
      label: `${rating} star${rating !== 1 ? "s" : ""}`,
      sets: (byRating.get(rating) ?? []).sort(compareSets),
    }));

    return { sections, totalCount: sets.length };
  }
}

function compareSets(a: SetViewModel, b: SetViewModel): number {
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

function groupByYearAndWave(
  sets: SetViewModel[],
): Record<string, Record<Wave, SetViewModel[]>> {
  const grouped: Record<string, Record<Wave, SetViewModel[]>> = {};
  for (const set of sets) {
    if (!grouped[set.releaseYear]) {
      grouped[set.releaseYear] = {} as Record<Wave, SetViewModel[]>;
    }
    const waveSets = grouped[set.releaseYear][set.wave] ?? [];
    waveSets.push(set);
    grouped[set.releaseYear][set.wave] = waveSets;
  }
  return grouped;
}

function countByYearAndWave(
  sets: BionicleSet[],
): Record<string, Record<Wave, number>> {
  const counts: Record<string, Record<Wave, number>> = {};
  for (const set of sets) {
    if (!counts[set.releaseYear]) {
      counts[set.releaseYear] = {} as Record<Wave, number>;
    }
    counts[set.releaseYear][set.wave] =
      (counts[set.releaseYear][set.wave] ?? 0) + 1;
  }
  return counts;
}

function sortedWaves(yearSets: Record<Wave, SetViewModel[]>): Wave[] {
  const wavesInYear = Object.keys(yearSets) as Wave[];

  return wavesInYear.toSorted((a, b) => {
    const indexA = Object.values(Wave).indexOf(a);
    const indexB = Object.values(Wave).indexOf(b);
    return indexA - indexB;
  });
}
