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

export class UserCollectionService {
  constructor(
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly setsRepository: SetsRepository,
    private readonly setRatingRepository: SetRatingRepositoryPort,
  ) {}

  async toggleSet(userId: string, setNumber: string) {
    const set = this.setsRepository.findOne(setNumber);
    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    const isInCollection = await this.collectionRepository.isInCollection(
      userId,
      setNumber,
    );

    if (isInCollection) {
      return await this.collectionRepository.deleteFromCollection(
        userId,
        setNumber,
      );
    }

    await this.collectionRepository.insert(userId, setNumber);
  }

  async getCollectionListViewModel(userId: string): Promise<SetsListViewModel> {
    const [userSetsNumbers, ratingsBySet, averageRatings] = await Promise.all([
      this.collectionRepository.getUserCollection(userId),
      this.setRatingRepository.getUserRatings(userId),
      this.setRatingRepository.getAverageRatings(),
    ]);
    const allSets = this.setsRepository.getAll();
    const byNumber = new Map(allSets.map((s) => [s.catalogNumber, s]));

    const userSets: SetViewModel[] = [];

    for (const num of userSetsNumbers) {
      const set = byNumber.get(num);
      if (set) {
        userSets.push({
          ...set,
          isInCollection: true,
          userRating: ratingsBySet[num],
          averageRating: averageRatings[num],
        });
      }
    }

    return SetsListViewModel.fromSetViewModels(userSets).toCollectionViewModel(
      allSets,
    );
  }
}

export const userCollectionService = new UserCollectionService(
  userCollectionRepository,
  setsRepository,
  setRatingRepository,
);
