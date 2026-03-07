import { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

type WaveSection = {
  wave: Wave;
  sets: SetViewModel[];
};

type YearSection = {
  year: string;
  waves: WaveSection[];
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

      return {
        year,
        waves: waves.map((wave) => ({
          wave,
          sets: yearSets[wave] ?? [],
        })),
      };
    });

    return new SetsListViewModel(data, sets.length);
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

  private static getSortedWavesForYear(
    yearSets: Record<Wave, SetViewModel[]>,
  ): Wave[] {
    const wavesInYear = Object.keys(yearSets) as Wave[];

    return wavesInYear.toSorted((a, b) => {
      const indexA = Object.values(Wave).indexOf(a);
      const indexB = Object.values(Wave).indexOf(b);
      return indexA - indexB;
    });
  }
}
