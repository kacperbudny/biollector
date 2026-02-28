import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserCollectionRepositoryPort,
  userCollectionRepository,
} from "@/data/repositories/user-collection.repository";
import { WAVE_ORDER, type Wave } from "@/data/sets";
import type {
  SetsListViewModel,
  SetViewModel,
} from "@/domain/view-models/set.view-model";

export class SetsService {
  constructor(
    private readonly repository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
  ) {}

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.repository.getAll();
    const collectionSetNumbers = userId
      ? await this.userCollectionRepository.getUserCollection(userId)
      : [];

    const setsWithStatus: SetViewModel[] = sets.map((set) => ({
      ...set,
      isInCollection: collectionSetNumbers.includes(set.catalogNumber),
    }));

    const grouped = this.groupSetsByYearAndWave(setsWithStatus);
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

  private groupSetsByYearAndWave(sets: SetViewModel[]) {
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
    yearSets: { [wave in Wave]?: SetViewModel[] },
  ): Wave[] {
    const wavesInYear = Object.keys(yearSets) as Wave[];
    return WAVE_ORDER.filter((wave) => wavesInYear.includes(wave));
  }
}

export const setsService = new SetsService(
  setsRepository,
  userCollectionRepository,
);

type GroupedSets = {
  [year: string]: {
    [wave in Wave]?: SetViewModel[];
  };
};
