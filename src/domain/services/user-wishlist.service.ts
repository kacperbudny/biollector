import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import type { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { logger } from "@/lib/logger";

export class UserWishlistService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly wishlistRepository: UserWishlistRepositoryPort,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  async getWishlistViewModel(userId: string): Promise<SetsListViewModel> {
    const ctx = await this.setViewModelContextLoader.load({
      userId,
    });

    const wishlistSetNumbers = Object.keys(ctx.userWishlistStateBySet);

    const sets = this.setsRepository.getByCatalogNumbers(wishlistSetNumbers);
    const byNumber = new Map(sets.map((s) => [s.catalogNumber, s]));

    const setViewModels: SetViewModel[] = [];

    for (const num of wishlistSetNumbers) {
      const set = byNumber.get(num);
      if (set) {
        setViewModels.push(
          SetViewModel.build({
            set,
            userCollectionBySet: ctx.userCollectionBySet,
            userRatings: ctx.userRatingsBySet,
            averageRatings: ctx.averageRatingsBySet,
            userWishlistState: ctx.userWishlistStateBySet,
          }),
        );
      }
    }

    return {
      sets: setViewModels,
      totalCount: setViewModels.length,
    };
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
      logger.info("Set removed from wishlist", { userId, setNumber });
      return;
    }

    await this.wishlistRepository.setWishlist(userId, setNumber, scale);
    logger.info("Wishlist updated", { userId, setNumber, scale });
  }
}
