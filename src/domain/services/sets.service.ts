import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  getSetsCount(): number {
    return this.setsRepository.getAll().length;
  }

  async getRandomSets(count: number, userId?: string): Promise<SetViewModel[]> {
    const sets = this.setsRepository.getRandomSets(count);
    const ctx = await this.setViewModelContextLoader.load({ userId });

    return sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers: ctx.collectionSetNumbers,
        userRatings: ctx.userRatingsBySet,
        averageRatings: ctx.averageRatingsBySet,
        userWishlistState: ctx.userWishlistStateBySet,
      }),
    );
  }

  async getTopRatedSets(
    count: number,
    userId?: string,
  ): Promise<SetViewModel[]> {
    const ctx = await this.setViewModelContextLoader.load({
      userId,
      averageRatings: {
        sortBy: "rating",
        sortOrder: "desc",
        limit: count,
      },
    });
    const sets = this.setsRepository.getByCatalogNumbers(
      Object.keys(ctx.averageRatingsBySet),
    );

    return sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers: ctx.collectionSetNumbers,
        userRatings: ctx.userRatingsBySet,
        averageRatings: ctx.averageRatingsBySet,
        userWishlistState: ctx.userWishlistStateBySet,
      }),
    );
  }

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.setsRepository.getAll();
    const ctx = await this.setViewModelContextLoader.load({ userId });

    const setViewModels = sets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers: ctx.collectionSetNumbers,
        userRatings: ctx.userRatingsBySet,
        averageRatings: ctx.averageRatingsBySet,
        userWishlistState: ctx.userWishlistStateBySet,
      }),
    );

    return SetsListViewModel.fromSetViewModels(setViewModels);
  }
}
