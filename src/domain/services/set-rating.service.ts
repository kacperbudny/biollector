import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { SetsRepository } from "@/data/repositories/sets.repository";
import { SetRatingEntity } from "@/domain/set-rating.entity";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { logger } from "@/lib/logger";

export class SetRatingService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  async getRatingsViewModel(userId: string): Promise<SetsListViewModel> {
    const ctx = await this.setViewModelContextLoader.load({
      userId,
    });

    const ratedSetNumbers = Object.keys(ctx.userRatingsBySet);

    const sets = this.setsRepository.getByCatalogNumbers(ratedSetNumbers);
    const byNumber = new Map(sets.map((s) => [s.catalogNumber, s]));

    const setViewModels: SetViewModel[] = [];

    for (const num of ratedSetNumbers) {
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

  async getTotalRatingsCount(): Promise<number> {
    return this.setRatingRepository.getTotalRatingsCount();
  }

  async setRating(
    userId: string,
    setNumber: string,
    rating: number,
  ): Promise<void> {
    const set = this.setsRepository.findOne(setNumber);

    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    await this.setRatingRepository.setRating(
      SetRatingEntity.create({ userId, setNumber, rating }),
    );
    logger.info("Set rating saved", { userId, setNumber, rating });
  }
}
