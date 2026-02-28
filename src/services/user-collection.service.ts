import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import {
  type UserCollectionRepositoryPort,
  userCollectionRepository,
} from "@/data/repositories/user-collection.repository";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export class UserCollectionService {
  constructor(
    private readonly collectionRepository: UserCollectionRepositoryPort,
    private readonly setsRepository: SetsRepository,
  ) {}

  async addSet(userId: string, setNumber: string): Promise<void> {
    await this.collectionRepository.insert(userId, setNumber);
  }

  async removeSet(userId: string, setNumber: string): Promise<void> {
    await this.collectionRepository.deleteByUserAndSet(userId, setNumber);
  }

  async getSetsForUser(userId: string): Promise<SetViewModel[]> {
    const userSetsNumbers =
      await this.collectionRepository.getSetNumbersByUserId(userId);
    const allSets = this.setsRepository.getAll();
    const byNumber = new Map(allSets.map((s) => [s.catalogNumber, s]));

    const result: SetViewModel[] = [];

    for (const num of userSetsNumbers) {
      const set = byNumber.get(num);
      if (set) {
        result.push({ ...set, isInCollection: true });
      }
    }

    return result;
  }
}

export const userCollectionService = new UserCollectionService(
  userCollectionRepository,
  setsRepository,
);
