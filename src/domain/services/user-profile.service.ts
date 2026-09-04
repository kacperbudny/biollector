import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserRepositoryPort } from "@/data/repositories/user.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { UserProfileViewModel } from "@/domain/view-models/user-profile.view-model";

export class UserProfileService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly wishlistRepository: UserWishlistRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly setsRepository: SetsRepository,
  ) {}

  async getPublicProfileViewModel(
    userId: string,
  ): Promise<UserProfileViewModel | null> {
    const owner = await this.userRepository.findById(userId);
    if (!owner) {
      return null;
    }

    const [userCollectionBySet, userWishlistState, averageRatings] =
      await Promise.all([
        this.collectionRepository.getUserCollection(userId),
        this.wishlistRepository.getWishlistState(userId),
        this.setRatingRepository.getAverageRatings(),
      ]);

    const wishlistSetNumbers = Object.entries(userWishlistState)
      .filter(([, scale]) => scale !== UserWishlistScale.NOT_INTERESTED)
      .map(([setNumber]) => setNumber);

    return UserProfileViewModel.from({
      displayName: owner.displayName,
      collection: this.buildPublicSetsList(
        Object.keys(userCollectionBySet),
        averageRatings,
      ),
      wishlist: this.buildPublicSetsList(
        wishlistSetNumbers,
        averageRatings,
        userWishlistState,
      ),
    });
  }

  private buildPublicSetsList(
    setNumbers: string[],
    averageRatings: Record<string, number>,
    userWishlistState: Record<string, number> = {},
  ): SetsListViewModel {
    const sets = this.setsRepository
      .getByCatalogNumbers(setNumbers)
      .map((set) =>
        SetViewModel.build({
          set,
          averageRatings,
          userWishlistState,
        }),
      );

    return {
      sets,
      totalCount: sets.length,
    };
  }
}
