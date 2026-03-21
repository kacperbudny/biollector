import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import type { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class UserWishlistService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly wishlistRepository: UserWishlistRepositoryPort,
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
  ) {}

  async getWishlistViewModel(userId: string): Promise<SetsListViewModel> {
    const [wishlistState, collectionSetNumbers, ratingsBySet, averageRatings] =
      await Promise.all([
        this.wishlistRepository.getWishlistState(userId, {
          wishlistedOnly: true,
        }),
        this.collectionRepository.getUserCollection(userId),
        this.setRatingRepository.getUserRatings(userId),
        this.setRatingRepository.getAverageRatings(),
      ]);

    const wishlistedSetNumbers = Object.keys(wishlistState);

    const sets = this.setsRepository.getByCatalogNumbers(wishlistedSetNumbers);
    const byNumber = new Map(sets.map((s) => [s.catalogNumber, s]));

    const wishlistedSetViewModels: SetViewModel[] = [];

    for (const num of wishlistedSetNumbers) {
      const set = byNumber.get(num);
      if (set) {
        wishlistedSetViewModels.push(
          SetViewModel.fromBionicleSet({
            set,
            collectionSetNumbers,
            ratingsBySet,
            averageRatings,
            wishlistState,
          }),
        );
      }
    }

    return SetsListViewModel.fromSetViewModels(wishlistedSetViewModels);
  }

  async setWishlist(
    userId: string,
    setNumber: string,
    scale: UserWishlistScale | null,
  ): Promise<void> {
    const set = this.setsRepository.findOne(setNumber);
    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    if (scale === null) {
      await this.wishlistRepository.deleteFromWishlist(userId, setNumber);
      return;
    }

    await this.wishlistRepository.setWishlist(userId, setNumber, scale);
  }
}
