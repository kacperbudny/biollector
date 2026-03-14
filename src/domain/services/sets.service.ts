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
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
  ) {}

  getSetsCount(): number {
    return this.setsRepository.getAll().length;
  }

  async getRandomSets(count: number, userId?: string): Promise<SetViewModel[]> {
    const sets = this.setsRepository.getRandomSets(count);
    const [averageRatings, collectionSetNumbers, ratingsBySet] =
      await Promise.all([
        this.setRatingRepository.getAverageRatings(),
        userId
          ? this.userCollectionRepository.getUserCollection(userId)
          : Promise.resolve([]),
        userId
          ? this.setRatingRepository.getUserRatings(userId)
          : Promise.resolve({} as Record<string, number>),
      ]);

    return SetViewModel.fromBionicleSets(
      sets,
      collectionSetNumbers,
      ratingsBySet,
      averageRatings,
    );
  }

  async getTopRatedSets(
    count: number,
    userId?: string,
  ): Promise<SetViewModel[]> {
    const [topRated, collectionSetNumbers, ratingsBySet] = await Promise.all([
      this.setRatingRepository.getAverageRatings({
        sortBy: "rating",
        sortOrder: "desc",
        limit: count,
      }),
      userId
        ? this.userCollectionRepository.getUserCollection(userId)
        : Promise.resolve([]),
      userId
        ? this.setRatingRepository.getUserRatings(userId)
        : Promise.resolve({} as Record<string, number>),
    ]);
    const sets = this.setsRepository.getByCatalogNumbers(Object.keys(topRated));

    return SetViewModel.fromBionicleSets(
      sets,
      collectionSetNumbers,
      ratingsBySet,
      topRated,
    );
  }

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.setsRepository.getAll();
    const [collectionSetNumbers, ratingsBySet, averageRatings] =
      await Promise.all([
        userId
          ? this.userCollectionRepository.getUserCollection(userId)
          : Promise.resolve([]),
        userId
          ? this.setRatingRepository.getUserRatings(userId)
          : Promise.resolve({} as Record<string, number>),
        this.setRatingRepository.getAverageRatings(),
      ]);

    const setViewModels: SetViewModel[] = SetViewModel.fromBionicleSets(
      sets,
      collectionSetNumbers,
      ratingsBySet,
      averageRatings,
    );

    return SetsListViewModel.fromSetViewModels(setViewModels);
  }
}

export const setsService = new SetsService(
  setsRepository,
  userCollectionRepository,
  setRatingRepository,
);
