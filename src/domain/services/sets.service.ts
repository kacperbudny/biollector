import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserCollectionRepositoryPort,
  userCollectionRepository,
} from "@/data/repositories/user-collection.repository";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export class SetsService {
  constructor(
    private readonly repository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
  ) {}

  async getSetsListViewModel(userId?: string): Promise<SetsListViewModel> {
    const sets = this.repository.getAll();
    const collectionSetNumbers = userId
      ? await this.userCollectionRepository.getUserCollection(userId)
      : [];

    const setsWithStatus: SetViewModel[] = sets.map((set) => ({
      ...set,
      isInCollection: collectionSetNumbers.includes(set.catalogNumber),
    }));

    return SetsListViewModel.fromSetViewModels(setsWithStatus);
  }
}

export const setsService = new SetsService(
  setsRepository,
  userCollectionRepository,
);
