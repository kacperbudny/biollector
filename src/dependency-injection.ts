import { db } from "@/data/db/config";
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
import { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";

export const setsRepository = new SetsRepository(bionicleSets);

export const userCollectionRepository = new UserCollectionRepository(db);

export const userWishlistRepository = new UserWishlistRepository(db);

export const setRatingRepository = new SetRatingRepository(db);

export const setViewModelContextLoader = new SetViewModelContextLoader(
  userCollectionRepository,
  setRatingRepository,
  userWishlistRepository,
);

export const setsService = new SetsService(
  setsRepository,
  setViewModelContextLoader,
);

export const setRatingService = new SetRatingService(
  setsRepository,
  setRatingRepository,
);

export const userCollectionService = new UserCollectionService(
  userCollectionRepository,
  setsRepository,
  setViewModelContextLoader,
);

export const userWishlistService = new UserWishlistService(
  setsRepository,
  userWishlistRepository,
  setViewModelContextLoader,
);

export const recommendationsService = new RecommendationsService(
  setsRepository,
  setViewModelContextLoader,
);
