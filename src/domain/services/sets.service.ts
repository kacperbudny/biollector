import {
  type SetRatingRepositoryPort,
  setRatingRepository,
} from "@/data/repositories/set-rating.repository";
import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserCollectionRepositoryPort,
  userCollectionRepository,
} from "@/data/repositories/user-collection.repository";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
  ) {}

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.setsRepository.getAll();
    const [collectionSetNumbers, ratingsBySet] = userId
      ? await Promise.all([
          this.userCollectionRepository.getUserCollection(userId),
          this.setRatingRepository.getUserRatings(userId),
        ])
      : [[] as string[], {} as Record<string, number>];

    const setsWithStatus: SetViewModel[] = sets.map((set) => ({
      ...set,
      isInCollection: collectionSetNumbers.includes(set.catalogNumber),
      userRating: ratingsBySet[set.catalogNumber],
    }));

    return SetsListViewModel.fromSetViewModels(setsWithStatus);
  }
}

export const setsService = new SetsService(
  setsRepository,
  userCollectionRepository,
  setRatingRepository,
);
