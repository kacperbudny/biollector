import type {
  GetAverageRatingsOptions,
  SetRatingRepositoryPort,
} from "@/data/repositories/set-rating.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";

type SetViewModelContext = {
  collectionSetNumbers: string[];
  userRatingsBySet: Record<string, number>;
  averageRatingsBySet: Record<string, number>;
  userWishlistStateBySet: Record<string, number>;
};

type LoadSetViewModelContextOptions = {
  userId?: string;
  averageRatings?: GetAverageRatingsOptions;
};

export class SetViewModelContextLoader {
  constructor(
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly userWishlistRepository: UserWishlistRepositoryPort,
  ) {}

  async load(
    options: LoadSetViewModelContextOptions = {},
  ): Promise<SetViewModelContext> {
    if (!options.userId) {
      const averageRatings = await this.setRatingRepository.getAverageRatings(
        options.averageRatings,
      );

      return {
        collectionSetNumbers: [],
        userRatingsBySet: {},
        userWishlistStateBySet: {},
        averageRatingsBySet: averageRatings,
      };
    }

    const [
      collectionSetNumbers,
      userRatingsBySet,
      averageRatingsBySet,
      userWishlistStateBySet,
    ] = await Promise.all([
      this.userCollectionRepository.getUserCollection(options.userId),
      this.setRatingRepository.getUserRatings(options.userId),
      this.setRatingRepository.getAverageRatings(options.averageRatings),
      this.userWishlistRepository.getWishlistState(options.userId),
    ]);

    return {
      collectionSetNumbers,
      userRatingsBySet,
      averageRatingsBySet,
      userWishlistStateBySet,
    };
  }
}
