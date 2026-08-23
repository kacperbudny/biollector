import type { SetsRepository } from "@/data/repositories/sets.repository";
import { SetSearch } from "@/domain/set-search";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import {
  type SetSearchResultsViewModel,
  SetSearchResultViewModel,
} from "@/domain/view-models/set-search-result.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  getSetsCount(): number {
    return this.setsRepository.getAll().length;
  }

  searchSets(
    query: string,
    { limit = 10 }: { limit?: number } = {},
  ): SetSearchResultsViewModel {
    const search = new SetSearch(query);
    if (search.isEmpty) {
      return { sets: [], totalCount: 0 };
    }

    const matches = this.setsRepository
      .getAll()
      .filter((set) => search.matches(set))
      .toSorted((a, b) => search.compare(a, b));

    return {
      sets: matches.slice(0, limit).map(SetSearchResultViewModel.fromSet),
      totalCount: matches.length,
    };
  }

  async getRandomSets(count: number, userId?: string): Promise<SetViewModel[]> {
    const sets = this.setsRepository.getRandomSets(count);
    const ctx = await this.setViewModelContextLoader.load({ userId });

    return sets.map((set) =>
      SetViewModel.build({
        set,
        userCollectionBySet: ctx.userCollectionBySet,
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
      SetViewModel.build({
        set,
        userCollectionBySet: ctx.userCollectionBySet,
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
      SetViewModel.build({
        set,
        userCollectionBySet: ctx.userCollectionBySet,
        userRatings: ctx.userRatingsBySet,
        averageRatings: ctx.averageRatingsBySet,
        userWishlistState: ctx.userWishlistStateBySet,
      }),
    );

    return {
      sets: setViewModels,
      totalCount: setViewModels.length,
    };
  }
}
