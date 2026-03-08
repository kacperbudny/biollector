import type { BionicleSet } from "@/domain/sets";
import { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type WaveSection = {
  wave: Wave;
  sets: SetViewModel[];
  totalCount: number;
  collectionCount?: number;
  isComplete?: boolean;
};

export type YearSection = {
  year: string;
  waves: WaveSection[];
  totalCount: number;
  collectionCount?: number;
  isComplete?: boolean;
};

export class SetsListViewModel {
  constructor(
    public readonly data: YearSection[],
    public readonly totalCount: number,
    public readonly collectionCount?: number,
  ) {}

  static fromSetViewModels(sets: SetViewModel[]): SetsListViewModel {
    const grouped = SetsListViewModel.groupSetsByYearAndWave(sets);
    const years = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

    const data = years.map((year) => {
      const yearSets = grouped[year];
      const waves = SetsListViewModel.getSortedWavesForYear(yearSets);
      let totalInYear = 0;

      const waveSections = waves.map((wave) => {
        const waveSets = yearSets[wave] ?? [];
        const count = waveSets.length;
        totalInYear += count;
        return {
          wave,
          sets: waveSets,
          totalCount: count,
        };
      });

      return {
        year,
        waves: waveSections,
        totalCount: totalInYear,
      };
    });

    return new SetsListViewModel(data, sets.length);
  }

  toCollectionViewModel(allSets: BionicleSet[]): SetsListViewModel {
    const totalsByYearAndWave = SetsListViewModel.countByYearAndWave(allSets);

    // we have to re-calculate the total count for each year and wave because the user's collection may not have all sets
    const data = this.data.map((yearSection) => {
      const yearTotals = totalsByYearAndWave[yearSection.year] ?? {};
      const yearTotalCount = Object.values(yearTotals).reduce(
        (sum, count) => sum + count,
        0,
      );
      const yearCollectionCount = yearSection.totalCount;

      const waves = yearSection.waves.map((waveSection) => {
        const waveTotalCount = yearTotals[waveSection.wave] ?? 0;
        const waveCollectionCount = waveSection.totalCount;

        return {
          ...waveSection,
          totalCount: waveTotalCount,
          collectionCount: waveCollectionCount,
          isComplete: waveTotalCount === waveCollectionCount,
        };
      });

      return {
        ...yearSection,
        waves,
        totalCount: yearTotalCount,
        collectionCount: yearCollectionCount,
        isComplete: yearTotalCount === yearCollectionCount,
      };
    });

    return new SetsListViewModel(data, allSets.length, this.totalCount);
  }

  private static countByYearAndWave(
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

  private static groupSetsByYearAndWave(sets: SetViewModel[]) {
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

  private static getSortedWavesForYear<T>(yearData: Record<Wave, T>): Wave[] {
    const wavesInYear = Object.keys(yearData) as Wave[];

    return wavesInYear.toSorted((a, b) => {
      const indexA = Object.values(Wave).indexOf(a);
      const indexB = Object.values(Wave).indexOf(b);
      return indexA - indexB;
    });
  }
}
