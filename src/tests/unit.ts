import { vi } from "vitest";
import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import { bionicleSets } from "@/data/sets";
import {
  RecommendationsService,
  type RecommendationWeights,
} from "@/domain/services/recommendations.service";

export function userCollectionRepositoryMock(
  overrides?: Partial<UserCollectionRepositoryPort>,
): UserCollectionRepositoryPort {
  return {
    insert: vi.fn(),
    deleteFromCollection: vi.fn(),
    getUserCollection: vi.fn().mockResolvedValue([]),
    isInCollection: vi.fn(),
    getDistinctCollectionsCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

export function userWishlistRepositoryMock(
  overrides?: Partial<UserWishlistRepositoryPort>,
): UserWishlistRepositoryPort {
  return {
    getWishlistState: vi.fn().mockResolvedValue({}),
    deleteFromWishlist: vi.fn(),
    setWishlist: vi.fn(),
    ...overrides,
  };
}

export function setRatingRepositoryMock(
  overrides?: Partial<SetRatingRepositoryPort>,
): SetRatingRepositoryPort {
  return {
    getUserRatings: vi.fn().mockResolvedValue({}),
    getAverageRatings: vi.fn().mockResolvedValue({}),
    setRating: vi.fn(),
    getTotalRatingsCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

export function recommendationsServiceMock(
  overrides?: Partial<{
    setsRepository: SetsRepository;
    userCollectionRepository: UserCollectionRepositoryPort;
    setRatingRepository: SetRatingRepositoryPort;
    userWishlistRepository: UserWishlistRepositoryPort;
    recommendationWeights: RecommendationWeights;
  }>,
) {
  return new RecommendationsService(
    overrides?.setsRepository ?? new SetsRepository(bionicleSets),
    overrides?.userCollectionRepository ?? userCollectionRepositoryMock(),
    overrides?.setRatingRepository ?? setRatingRepositoryMock(),
    overrides?.userWishlistRepository ?? userWishlistRepositoryMock(),
    overrides?.recommendationWeights,
  );
}
