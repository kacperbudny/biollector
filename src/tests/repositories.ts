import { vi } from "vitest";
import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";

export function userCollectionRepositoryMock(
  overrides?: Partial<UserCollectionRepositoryPort>,
): UserCollectionRepositoryPort {
  return {
    insert: vi.fn(),
    deleteFromCollection: vi.fn(),
    getUserCollection: vi.fn(),
    isInCollection: vi.fn(),
    getDistinctCollectionsCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

export function setRatingRepositoryMock(
  overrides?: Partial<SetRatingRepositoryPort>,
): SetRatingRepositoryPort {
  return {
    getUserRatings: vi.fn(),
    getAverageRatings: vi.fn().mockResolvedValue({}),
    setRating: vi.fn(),
    getTotalRatingsCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}
