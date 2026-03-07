import { type BionicleSet, Wave } from "@/domain/sets";

export type SetViewModel = BionicleSet & { isInCollection: boolean };

export type SetsListViewModel = {
  year: string;
  waves: { wave: Wave; sets: SetViewModel[] }[];
}[];

export namespace SetsListViewModel {
  export function fromSetViewModels(sets: SetViewModel[]): SetsListViewModel {
    const grouped = groupSetsByYearAndWave(sets);
    const years = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

    return years.map((year) => {
      const yearSets = grouped[year];
      const waves = getSortedWavesForYear(yearSets);

      return {
        year,
        waves: waves.map((wave) => ({
          wave,
          sets: yearSets[wave] ?? [],
        })),
      };
    });
  }

  function groupSetsByYearAndWave(sets: SetViewModel[]) {
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

  function getSortedWavesForYear(
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
