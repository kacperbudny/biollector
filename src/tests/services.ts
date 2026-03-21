import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import { bionicleSets } from "@/data/sets";
import { RecommendationsService } from "@/domain/services/recommendations.service";
import {
  setRatingRepositoryMock,
  userCollectionRepositoryMock,
  userWishlistRepositoryMock,
} from "@/tests/repositories";

export function recommendationsServiceMock(
  overrides?: Partial<{
    setsRepository: SetsRepository;
    userCollectionRepository: UserCollectionRepositoryPort;
    setRatingRepository: SetRatingRepositoryPort;
    userWishlistRepository: UserWishlistRepositoryPort;
  }>,
) {
  return new RecommendationsService(
    overrides?.setsRepository ?? new SetsRepository(bionicleSets),
    overrides?.userCollectionRepository ?? userCollectionRepositoryMock(),
    overrides?.setRatingRepository ?? setRatingRepositoryMock(),
    overrides?.userWishlistRepository ?? userWishlistRepositoryMock(),
  );
}
