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

export class UserCollectionService {
  constructor(
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly setsRepository: SetsRepository,
  ) {}

  async toggleSet(userId: string, setNumber: string) {
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
    const userSetsNumbers =
      await this.collectionRepository.getUserCollection(userId);
    const allSets = this.setsRepository.getAll();
    const byNumber = new Map(allSets.map((s) => [s.catalogNumber, s]));

    const userSets: SetViewModel[] = [];

    for (const num of userSetsNumbers) {
      const set = byNumber.get(num);
      if (set) {
        userSets.push({ ...set, isInCollection: true });
      }
    }

    return SetsListViewModel.forCollection(userSets, allSets);
  }
}

export const userCollectionService = new UserCollectionService(
  userCollectionRepository,
  setsRepository,
);
