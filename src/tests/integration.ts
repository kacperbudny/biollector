import { SetRatingRepository } from "@/data/repositories/set-rating.repository";
import { SetsRepository } from "@/data/repositories/sets.repository";
import { UserCollectionRepository } from "@/data/repositories/user-collection.repository";
import { UserWishlistRepository } from "@/data/repositories/user-wishlist.repository";
import { bionicleSets } from "@/data/sets";
import { RecommendationsService } from "@/domain/services/recommendations.service";
import { SetRatingService } from "@/domain/services/set-rating.service";
import { SetsService } from "@/domain/services/sets.service";
import { UserCollectionService } from "@/domain/services/user-collection.service";
import { UserWishlistService } from "@/domain/services/user-wishlist.service";
import { getTestDb } from "@/tests/db";

export const integrationSetsRepository = new SetsRepository(bionicleSets);

export function getIntegrationSetRatingRepository(): SetRatingRepository {
  return new SetRatingRepository(getTestDb());
}

export function getIntegrationUserCollectionRepository(): UserCollectionRepository {
  return new UserCollectionRepository(getTestDb());
}

export function getIntegrationUserWishlistRepository(): UserWishlistRepository {
  return new UserWishlistRepository(getTestDb());
}

export function getIntegrationSetRatingService(): SetRatingService {
  return new SetRatingService(
    integrationSetsRepository,
    getIntegrationSetRatingRepository(),
  );
}

export function getIntegrationSetsService(): SetsService {
  return new SetsService(
    integrationSetsRepository,
    getIntegrationUserCollectionRepository(),
    getIntegrationSetRatingRepository(),
    getIntegrationUserWishlistRepository(),
  );
}

export function getIntegrationUserCollectionService(): UserCollectionService {
  return new UserCollectionService(
    getIntegrationUserCollectionRepository(),
    integrationSetsRepository,
    getIntegrationSetRatingRepository(),
    getIntegrationUserWishlistRepository(),
  );
}

export function getIntegrationUserWishlistService(): UserWishlistService {
  return new UserWishlistService(
    integrationSetsRepository,
    getIntegrationUserWishlistRepository(),
    getIntegrationUserCollectionRepository(),
    getIntegrationSetRatingRepository(),
  );
}

export function getIntegrationRecommendationsService(): RecommendationsService {
  return new RecommendationsService(
    integrationSetsRepository,
    getIntegrationUserCollectionRepository(),
    getIntegrationSetRatingRepository(),
    getIntegrationUserWishlistRepository(),
  );
}
