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
import {
  type UserWishlistRepositoryPort,
  userWishlistRepository,
} from "@/data/repositories/user-wishlist.repository";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly userWishlistRepository: UserWishlistRepositoryPort,
  ) {}

  getSetsCount(): number {
    return this.setsRepository.getAll().length;
  }

  async getRandomSets(count: number, userId?: string): Promise<SetViewModel[]> {
    const sets = this.setsRepository.getRandomSets(count);
    const [
      averageRatings,
      collectionSetNumbers,
      ratingsBySet,
      wishlistSetNumbers,
    ] = await Promise.all([
      this.setRatingRepository.getAverageRatings(),
      userId
        ? this.userCollectionRepository.getUserCollection(userId)
        : Promise.resolve([]),
      userId
        ? this.setRatingRepository.getUserRatings(userId)
        : Promise.resolve({} as Record<string, number>),
      userId
        ? this.userWishlistRepository.getUserWishlist(userId)
        : Promise.resolve([]),
    ]);

    return sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers,
        ratingsBySet,
        averageRatings,
        wishlistSetNumbers,
      }),
    );
  }

  async getTopRatedSets(
    count: number,
    userId?: string,
  ): Promise<SetViewModel[]> {
    const [topRated, collectionSetNumbers, ratingsBySet, wishlistSetNumbers] =
      await Promise.all([
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
        userId
          ? this.userWishlistRepository.getUserWishlist(userId)
          : Promise.resolve([]),
      ]);
    const sets = this.setsRepository.getByCatalogNumbers(Object.keys(topRated));

    return sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers,
        ratingsBySet,
        averageRatings: topRated,
        wishlistSetNumbers,
      }),
    );
  }

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.setsRepository.getAll();
    const [
      collectionSetNumbers,
      ratingsBySet,
      averageRatings,
      wishlistSetNumbers,
    ] = await Promise.all([
      userId
        ? this.userCollectionRepository.getUserCollection(userId)
        : Promise.resolve([]),
      userId
        ? this.setRatingRepository.getUserRatings(userId)
        : Promise.resolve({} as Record<string, number>),
      this.setRatingRepository.getAverageRatings(),
      userId
        ? this.userWishlistRepository.getUserWishlist(userId)
        : Promise.resolve([]),
    ]);

    const setViewModels = sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers,
        ratingsBySet,
        averageRatings,
        wishlistSetNumbers,
      }),
    );

    return SetsListViewModel.fromSetViewModels(setViewModels);
  }
}

export const setsService = new SetsService(
  setsRepository,
  userCollectionRepository,
  setRatingRepository,
  userWishlistRepository,
);
