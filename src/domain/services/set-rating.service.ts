import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { SetsRepository } from "@/data/repositories/sets.repository";
import { SetRatingEntity } from "@/domain/set-rating.entity";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";

export class SetRatingService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  async getRatingsViewModel(userId: string): Promise<SetsGroupedViewModel> {
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
            collectionSetNumbers: ctx.collectionSetNumbers,
            userRatings: ctx.userRatingsBySet,
            averageRatings: ctx.averageRatingsBySet,
            userWishlistState: ctx.userWishlistStateBySet,
          }),
        );
      }
    }

    return SetsGroupedViewModel.toRatings(setViewModels);
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
  }
}
