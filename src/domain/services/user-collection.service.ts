import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { logger } from "@/lib/logger";

export class UserCollectionService {
  constructor(
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly setsRepository: SetsRepository,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
  ) {}

  async getCollectionsCount(): Promise<number> {
    return this.collectionRepository.getDistinctCollectionsCount();
  }

  async toggleSet(userId: string, setNumber: string) {
    const set = this.setsRepository.findOne(setNumber);
    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    const isInCollection = await this.collectionRepository.isInCollection(
      userId,
      setNumber,
    );

    if (isInCollection) {
      await this.collectionRepository.deleteFromCollection(userId, setNumber);
      logger.info("Set removed from collection", { userId, setNumber });
      return;
    }

    await this.collectionRepository.insert(userId, setNumber);
    logger.info("Set added to collection", { userId, setNumber });
  }

  async getCollectionListViewModel(
    userId: string,
  ): Promise<SetsGroupedViewModel> {
    const ctx = await this.setViewModelContextLoader.load({ userId });
    const allSets = this.setsRepository.getAll();
    const byNumber = new Map(allSets.map((s) => [s.catalogNumber, s]));

    const userSets: SetViewModel[] = [];

    for (const num of ctx.collectionSetNumbers) {
      const set = byNumber.get(num);
      if (set) {
        userSets.push(
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

    return SetsGroupedViewModel.toCollection(userSets, allSets);
  }
}
