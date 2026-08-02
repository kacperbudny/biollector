import { bionicleSets } from "@/data/sets";
import { SetType, Wave } from "@/domain/sets";
import {
  getWishlistScaleLabel,
  UserWishlistScale,
} from "@/domain/user-wishlist";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type {
  FlatSetSection,
  NestedSetSection,
  SetGroup,
  SetSection,
  SetsGroupedViewModel,
} from "@/domain/view-models/sets-grouped.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export type SortOption = (typeof SetSort.OPTIONS)[number];
export type SortDirection = (typeof SetSort.DIRECTIONS)[number];

export class SetSort {
  private readonly option: SortOption;
  private readonly direction: SortDirection;
  private readonly displayCollectionCounts: boolean;

  constructor(
    option: SortOption = "year-wave",
    direction: SortDirection = "asc",
    isSignedIn = false,
    displayCollectionCounts = false,
  ) {
    this.option = SetSort.isOptionAllowed(option, isSignedIn)
      ? option
      : "year-wave";
    this.direction = direction;
    this.displayCollectionCounts = displayCollectionCounts;
  }

  static readonly OPTIONS = [
    "year-wave",
    "year",
    "wave",
    "catalog-number",
    "name",
    "set-type",
    "wishlist-scale",
    "user-rating",
    "average-rating",
    "date-added",
  ] as const;

  static readonly DIRECTIONS = ["asc", "desc"] as const;

  private static readonly SIGNED_IN_ONLY_OPTIONS: readonly SortOption[] = [
    "wishlist-scale",
    "user-rating",
    "date-added",
  ];

  static isOptionAllowed(option: SortOption, isSignedIn: boolean): boolean {
    if (!isSignedIn && SetSort.SIGNED_IN_ONLY_OPTIONS.includes(option)) {
      return false;
    }
    return true;
  }

  sort(vm: SetsListViewModel): SetsGroupedViewModel {
    const sections = this.buildSortedSections(vm.sets);
    const collectionCount = this.displayCollectionCounts
      ? vm.sets.filter((s) => s.isInCollection).length
      : undefined;

    return {
      sections,
      totalCount: vm.totalCount,
      collectionCount,
    };
  }

  private buildSortedSections(sets: SetViewModel[]): SetSection[] {
    switch (this.option) {
      case "year-wave":
        return this.sortByYearAndWave(sets);
      case "year":
        return this.sortByYear(sets);
      case "wave":
        return this.sortByWave(sets);
      case "catalog-number":
        return this.sortByCatalogNumber(sets);
      case "name":
        return this.sortByName(sets);
      case "set-type":
        return this.sortBySetType(sets);
      case "wishlist-scale":
        return this.sortByWishlistScale(sets);
      case "user-rating":
        return this.sortByUserRating(sets);
      case "average-rating":
        return this.sortByAverageRating(sets);
      case "date-added":
        return this.sortByDateAdded(sets);
    }
  }

  private sortByYearAndWave(sets: SetViewModel[]): NestedSetSection[] {
    const catalogTotals = this.countByYearAndWave(bionicleSets);
    const groupedByYearAndWave: Record<
      string,
      Record<string, SetViewModel[]>
    > = {};

    for (const set of sets) {
      if (!groupedByYearAndWave[set.releaseYear]) {
        groupedByYearAndWave[set.releaseYear] = {};
      }
      if (!groupedByYearAndWave[set.releaseYear][set.wave]) {
        groupedByYearAndWave[set.releaseYear][set.wave] = [];
      }
      groupedByYearAndWave[set.releaseYear][set.wave].push(set);
    }

    const years = Object.keys(groupedByYearAndWave).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return this.direction === "asc" ? numA - numB : numB - numA;
    });

    const waveOrder = Object.values(Wave);

    return years.map((year) => {
      const yearSetsMap = groupedByYearAndWave[year];
      const wavesInYear = Object.keys(yearSetsMap).sort((a, b) => {
        const indexA = waveOrder.indexOf(a as Wave);
        const indexB = waveOrder.indexOf(b as Wave);
        return this.direction === "asc" ? indexA - indexB : indexB - indexA;
      });

      const groups: SetGroup[] = wavesInYear.map((wave) => {
        const waveSets = yearSetsMap[wave].toSorted(this.compareSetsDefault);

        if (!this.displayCollectionCounts) {
          return {
            label: wave,
            sets: waveSets,
            totalCount: waveSets.length,
          };
        }

        const waveCatalogTotal =
          catalogTotals[year]?.[wave as Wave] ?? waveSets.length;
        const waveCollectionCount = waveSets.filter(
          (s) => s.isInCollection,
        ).length;

        return {
          label: wave,
          sets: waveSets,
          totalCount: waveCatalogTotal,
          collectionCount: waveCollectionCount,
          isComplete:
            waveCatalogTotal > 0 && waveCatalogTotal === waveCollectionCount,
        };
      });

      if (!this.displayCollectionCounts) {
        return {
          label: year,
          groups,
          totalCount: groups.reduce((sum, g) => sum + g.sets.length, 0),
        };
      }

      const yearCatalogTotals = catalogTotals[year];
      const yearCatalogTotalCount = yearCatalogTotals
        ? Object.values(yearCatalogTotals).reduce((sum, c) => sum + c, 0)
        : groups.reduce((sum, g) => sum + g.sets.length, 0);

      const yearCollectionCount = groups.reduce(
        (sum, g) => sum + (g.collectionCount ?? 0),
        0,
      );

      return {
        label: year,
        groups,
        totalCount: yearCatalogTotalCount,
        collectionCount: yearCollectionCount,
        isComplete:
          yearCatalogTotalCount > 0 &&
          yearCatalogTotalCount === yearCollectionCount,
      };
    });
  }

  private sortByYear(sets: SetViewModel[]): FlatSetSection[] {
    const byYear = new Map<string, SetViewModel[]>();

    for (const set of sets) {
      const bucket = byYear.get(set.releaseYear) ?? [];
      bucket.push(set);
      byYear.set(set.releaseYear, bucket);
    }

    const years = Array.from(byYear.keys()).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return this.direction === "asc" ? numA - numB : numB - numA;
    });

    return years.map((year) => ({
      label: year,
      sets: (byYear.get(year) ?? []).toSorted(this.compareSetsDefault),
    }));
  }

  private sortByWave(sets: SetViewModel[]): FlatSetSection[] {
    const byWave = new Map<Wave, SetViewModel[]>();

    for (const set of sets) {
      const bucket = byWave.get(set.wave) ?? [];
      bucket.push(set);
      byWave.set(set.wave, bucket);
    }

    const waveOrder = Object.values(Wave);
    const wavesPresent = Array.from(byWave.keys()).sort((a, b) => {
      const indexA = waveOrder.indexOf(a);
      const indexB = waveOrder.indexOf(b);
      return this.direction === "asc" ? indexA - indexB : indexB - indexA;
    });

    return wavesPresent.map((wave) => ({
      label: wave,
      sets: (byWave.get(wave) ?? []).toSorted(this.compareSetsDefault),
    }));
  }

  private sortByCatalogNumber(sets: SetViewModel[]): FlatSetSection[] {
    const sorted = sets.toSorted((a, b) => {
      const cmp = a.catalogNumber.localeCompare(b.catalogNumber, undefined, {
        numeric: true,
      });
      if (cmp !== 0) {
        return this.direction === "asc" ? cmp : -cmp;
      }
      return this.compareSetsDefault(a, b);
    });

    return [{ sets: sorted }];
  }

  private sortByName(sets: SetViewModel[]): FlatSetSection[] {
    const sorted = sets.toSorted((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      if (cmp !== 0) {
        return this.direction === "asc" ? cmp : -cmp;
      }
      return this.compareSetsDefault(a, b);
    });

    return [{ sets: sorted }];
  }

  private sortBySetType(sets: SetViewModel[]): FlatSetSection[] {
    const bySetType = new Map<SetType, SetViewModel[]>();

    for (const set of sets) {
      const bucket = bySetType.get(set.setType) ?? [];
      bucket.push(set);
      bySetType.set(set.setType, bucket);
    }

    const typeOrder = Object.values(SetType);
    const typesPresent = Array.from(bySetType.keys()).sort((a, b) => {
      const indexA = typeOrder.indexOf(a);
      const indexB = typeOrder.indexOf(b);
      return this.direction === "asc" ? indexA - indexB : indexB - indexA;
    });

    return typesPresent.map((type) => ({
      label: type,
      sets: (bySetType.get(type) ?? []).toSorted(this.compareSetsDefault),
    }));
  }

  private sortByWishlistScale(sets: SetViewModel[]): FlatSetSection[] {
    const byScale = new Map<UserWishlistScale | "none", SetViewModel[]>();

    for (const set of sets) {
      const key = set.wishlistScale ?? "none";
      const bucket = byScale.get(key) ?? [];
      bucket.push(set);
      byScale.set(key, bucket);
    }

    const allKeys: Array<UserWishlistScale | "none"> = [
      UserWishlistScale.MUST_HAVE,
      UserWishlistScale.HIGH,
      UserWishlistScale.MEDIUM,
      UserWishlistScale.LOW,
      UserWishlistScale.VERY_LOW,
      UserWishlistScale.NOT_INTERESTED,
      "none",
    ];

    const keysPresent = allKeys
      .filter((k) => byScale.has(k))
      .sort((a, b) => {
        if (a === "none") {
          return this.direction === "desc" ? 1 : -1;
        }
        if (b === "none") {
          return this.direction === "desc" ? -1 : 1;
        }
        return this.direction === "desc" ? b - a : a - b;
      });

    return keysPresent.map((key) => ({
      label:
        key === "none"
          ? "Not in wishlist"
          : getWishlistScaleLabel(key as UserWishlistScale),
      sets: (byScale.get(key) ?? []).toSorted(this.compareSetsDefault),
    }));
  }

  private sortByUserRating(sets: SetViewModel[]): FlatSetSection[] {
    const byRating = new Map<number | "none", SetViewModel[]>();

    for (const set of sets) {
      const key = set.userRating ?? "none";
      const bucket = byRating.get(key) ?? [];
      bucket.push(set);
      byRating.set(key, bucket);
    }

    const allKeys: Array<number | "none"> = [5, 4, 3, 2, 1, "none"];

    const keysPresent = allKeys
      .filter((k) => byRating.has(k))
      .sort((a, b) => {
        if (a === "none") {
          return this.direction === "desc" ? 1 : -1;
        }
        if (b === "none") {
          return this.direction === "desc" ? -1 : 1;
        }
        return this.direction === "desc" ? b - a : a - b;
      });

    return keysPresent.map((key) => ({
      label:
        key === "none" ? "No rating" : `${key} star${key !== 1 ? "s" : ""}`,
      sets: (byRating.get(key) ?? []).toSorted(this.compareSetsDefault),
    }));
  }

  private sortByAverageRating(sets: SetViewModel[]): FlatSetSection[] {
    const byBucket = new Map<number | "none", SetViewModel[]>();

    for (const set of sets) {
      const key =
        set.averageRating !== undefined
          ? Math.floor(set.averageRating)
          : "none";
      const bucket = byBucket.get(key) ?? [];
      bucket.push(set);
      byBucket.set(key, bucket);
    }

    const allKeys: Array<number | "none"> = [5, 4, 3, 2, 1, "none"];

    const keysPresent = allKeys
      .filter((k) => byBucket.has(k))
      .sort((a, b) => {
        if (a === "none") {
          return this.direction === "desc" ? 1 : -1;
        }
        if (b === "none") {
          return this.direction === "desc" ? -1 : 1;
        }
        return this.direction === "desc" ? b - a : a - b;
      });

    return keysPresent.map((key) => {
      const bucketSets = (byBucket.get(key) ?? []).toSorted((a, b) => {
        if (a.averageRating !== undefined && b.averageRating !== undefined) {
          const diff =
            this.direction === "desc"
              ? b.averageRating - a.averageRating
              : a.averageRating - b.averageRating;
          if (diff !== 0) {
            return diff;
          }
        }
        return this.compareSetsDefault(a, b);
      });

      return {
        label:
          key === "none" ? "No ratings" : `${key} star${key !== 1 ? "s" : ""}`,
        sets: bucketSets,
      };
    });
  }

  private sortByDateAdded(sets: SetViewModel[]): FlatSetSection[] {
    const sorted = sets.toSorted((a, b) => {
      if (a.isInCollection && b.isInCollection) {
        const timeA = a.addedToCollectionAt?.getTime() ?? 0;
        const timeB = b.addedToCollectionAt?.getTime() ?? 0;
        const diff = this.direction === "desc" ? timeB - timeA : timeA - timeB;
        if (diff !== 0) {
          return diff;
        }
        return this.compareSetsDefault(a, b);
      }

      if (a.isInCollection && !b.isInCollection) {
        return -1;
      }
      if (!a.isInCollection && b.isInCollection) {
        return 1;
      }

      return this.compareSetsDefault(a, b);
    });

    return [{ sets: sorted }];
  }

  private compareSetsDefault(a: SetViewModel, b: SetViewModel): number {
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
    return a.catalogNumber.localeCompare(b.catalogNumber, undefined, {
      numeric: true,
    });
  }

  private countByYearAndWave(
    sets: Array<{ releaseYear: string; wave: Wave }>,
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
}
