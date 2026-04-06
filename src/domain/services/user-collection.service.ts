import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

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
      return await this.collectionRepository.deleteFromCollection(
        userId,
        setNumber,
      );
    }

    await this.collectionRepository.insert(userId, setNumber);
  }

  async getCollectionListViewModel(userId: string): Promise<SetsListViewModel> {
    const ctx = await this.setViewModelContextLoader.load({ userId });
    const allSets = this.setsRepository.getAll();
    const byNumber = new Map(allSets.map((s) => [s.catalogNumber, s]));

    const userSets: SetViewModel[] = [];

    for (const num of ctx.collectionSetNumbers) {
      const set = byNumber.get(num);
      if (set) {
        userSets.push(
          SetViewModel.fromBionicleSet({
            set,
            collectionSetNumbers: ctx.collectionSetNumbers,
            userRatings: ctx.userRatingsBySet,
            averageRatings: ctx.averageRatingsBySet,
            userWishlistState: ctx.userWishlistStateBySet,
          }),
        );
      }
    }

    return SetsListViewModel.fromSetViewModels(userSets).toCollectionViewModel(
      allSets,
    );
  }
}
