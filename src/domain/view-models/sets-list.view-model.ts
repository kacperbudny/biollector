import type { BionicleSet } from "@/domain/sets";
import { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type WaveSection = {
  wave: Wave;
  sets: SetViewModel[];
  totalInWave: number;
  collectionCount?: number;
};

export type YearSection = {
  year: string;
  waves: WaveSection[];
  totalInYear: number;
  collectionCount?: number;
};

export class SetsListViewModel {
  constructor(
    public readonly data: YearSection[],
    public readonly totalCount: number,
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
          totalInWave: count,
        };
      });

      return {
        year,
        waves: waveSections,
        totalInYear,
      };
    });

    return new SetsListViewModel(data, sets.length);
  }

  static forCollection(
    userSets: SetViewModel[],
    allSets: BionicleSet[],
  ): SetsListViewModel {
    const totalsByYearAndWave = SetsListViewModel.countByYearAndWave(allSets);
    const grouped = SetsListViewModel.groupSetsByYearAndWave(userSets);
    const years = Object.keys(totalsByYearAndWave).sort(
      (a, b) => Number(a) - Number(b),
    );

    const data = years
      .map((year) => {
        const yearTotals = totalsByYearAndWave[year];
        const waves = SetsListViewModel.getSortedWavesForYear(yearTotals);
        const yearSets = grouped[year] ?? ({} as Record<Wave, SetViewModel[]>);
        let totalInYear = 0;

        const waveSections = waves
          .map((wave) => {
            const totalInWave = yearTotals[wave] ?? 0;
            totalInYear += totalInWave;
            const waveSets = yearSets[wave] ?? [];
            return {
              wave,
              sets: waveSets,
              totalInWave,
              collectionCount: waveSets.length,
            };
          })
          .filter((section) => section.sets.length > 0);

        if (waveSections.length === 0) {
          return null;
        }

        const collectionCount = waveSections.reduce(
          (sum, section) => sum + section.collectionCount,
          0,
        );

        return {
          year,
          waves: waveSections,
          totalInYear,
          collectionCount,
        };
      })
      .filter((section): section is NonNullable<typeof section> => section !== null);

    return new SetsListViewModel(data, userSets.length);
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

  private static getSortedWavesForYear<T>(
    yearData: Record<Wave, T>,
  ): Wave[] {
    const wavesInYear = Object.keys(yearData) as Wave[];

    return wavesInYear.toSorted((a, b) => {
      const indexA = Object.values(Wave).indexOf(a);
      const indexB = Object.values(Wave).indexOf(b);
      return indexA - indexB;
    });
  }
}
