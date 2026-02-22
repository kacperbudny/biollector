import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import { type BionicleSet, WAVE_ORDER, type Wave } from "@/data/sets";

export class SetsService {
  constructor(private readonly repository: SetsRepository) {}

  getSetsListViewModel() {
    const sets = this.repository.getAll();

    const grouped = this.groupSetsByYearAndWave(sets);
    const years = this.getYearsAscending(grouped);

    return years.map((year) => {
      const yearSets = grouped[year];
      const waves = this.getWavesForYear(yearSets);

      return {
        year,
        waves: waves.map((wave) => ({
          wave,
          sets: yearSets[wave] ?? [],
        })),
      };
    });
  }

  private groupSetsByYearAndWave(sets: BionicleSet[]) {
    const grouped: GroupedSets = {};

    for (const set of sets) {
      if (!grouped[set.releaseYear]) {
        grouped[set.releaseYear] = {};
      }
      const waveSets = grouped[set.releaseYear][set.wave] ?? [];
      waveSets.push(set);
      grouped[set.releaseYear][set.wave] = waveSets;
    }

    return grouped;
  }

  private getYearsAscending(grouped: GroupedSets): string[] {
    return Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
  }

  private getWavesForYear(
    yearSets: { [wave in Wave]?: BionicleSet[] },
  ): Wave[] {
    const wavesInYear = Object.keys(yearSets) as Wave[];
    return WAVE_ORDER.filter((wave) => wavesInYear.includes(wave));
  }
}

export const setsService = new SetsService(setsRepository);

type GroupedSets = {
  [year: string]: {
    [wave in Wave]?: BionicleSet[];
  };
};
