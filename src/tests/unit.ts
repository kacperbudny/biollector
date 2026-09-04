import { vi } from "vitest";
import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserRepositoryPort } from "@/data/repositories/user.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import { bionicleSets } from "@/data/sets";
import {
  RecommendationsService,
  type RecommendationWeights,
} from "@/domain/services/recommendations.service";
import { SetRatingService } from "@/domain/services/set-rating.service";
import { UserProfileService } from "@/domain/services/user-profile.service";
import { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";

export function getUserCollectionMock(setNumbers: string[]) {
  const result: Record<string, Date> = {};
  for (const num of setNumbers) {
    result[num] = new Date();
  }
  return vi.fn().mockResolvedValue(result);
}

export function userCollectionRepositoryMock(
  overrides?: Partial<UserCollectionRepositoryPort>,
): UserCollectionRepositoryPort {
  return {
    insert: vi.fn(),
    deleteFromCollection: vi.fn(),
    getUserCollection: vi.fn().mockResolvedValue({}),
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

export function setRatingServiceMock(
  overrides?: Partial<{
    setsRepository: SetsRepository;
    setRatingRepository: SetRatingRepositoryPort;
    setViewModelContextLoader: SetViewModelContextLoader;
  }>,
): SetRatingService {
  return new SetRatingService(
    overrides?.setsRepository ?? new SetsRepository(bionicleSets),
    overrides?.setRatingRepository ?? setRatingRepositoryMock(),
    overrides?.setViewModelContextLoader ?? setViewModelContextLoaderMock(),
  );
}

export function setViewModelContextLoaderMock(overrides?: {
  userCollection?: Partial<UserCollectionRepositoryPort>;
  setRating?: Partial<SetRatingRepositoryPort>;
  wishlist?: Partial<UserWishlistRepositoryPort>;
}): SetViewModelContextLoader {
  return new SetViewModelContextLoader(
    userCollectionRepositoryMock(overrides?.userCollection),
    setRatingRepositoryMock(overrides?.setRating),
    userWishlistRepositoryMock(overrides?.wishlist),
  );
}

export function userRepositoryMock(
  overrides?: Partial<UserRepositoryPort>,
): UserRepositoryPort {
  return {
    findById: vi.fn(),
    ...overrides,
  };
}

export function userProfileServiceMock(
  overrides?: Partial<{
    userRepository: Partial<UserRepositoryPort>;
    userCollection: Partial<UserCollectionRepositoryPort>;
    wishlist: Partial<UserWishlistRepositoryPort>;
    setRating: Partial<SetRatingRepositoryPort>;
    setsRepository: SetsRepository;
  }>,
): UserProfileService {
  return new UserProfileService(
    userRepositoryMock(overrides?.userRepository),
    userCollectionRepositoryMock(overrides?.userCollection),
    userWishlistRepositoryMock(overrides?.wishlist),
    setRatingRepositoryMock(overrides?.setRating),
    overrides?.setsRepository ?? new SetsRepository(bionicleSets),
  );
}

export function recommendationsServiceMock(
  overrides?: Partial<{
    setsRepository: SetsRepository;
    userCollectionRepository: UserCollectionRepositoryPort;
    setRatingRepository: SetRatingRepositoryPort;
    userWishlistRepository: UserWishlistRepositoryPort;
    setViewModelContextLoader: SetViewModelContextLoader;
    recommendationWeights: RecommendationWeights;
  }>,
) {
  const loader =
    overrides?.setViewModelContextLoader ??
    new SetViewModelContextLoader(
      overrides?.userCollectionRepository ?? userCollectionRepositoryMock(),
      overrides?.setRatingRepository ?? setRatingRepositoryMock(),
      overrides?.userWishlistRepository ?? userWishlistRepositoryMock(),
    );

  return new RecommendationsService(
    overrides?.setsRepository ?? new SetsRepository(bionicleSets),
    loader,
    overrides?.recommendationWeights,
  );
}
