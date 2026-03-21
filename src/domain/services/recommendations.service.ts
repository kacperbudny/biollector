import type { SetRatingRepositoryPort } from "@/data/repositories/set-rating.repository";
import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { UserCollectionRepositoryPort } from "@/data/repositories/user-collection.repository";
import type { UserWishlistRepositoryPort } from "@/data/repositories/user-wishlist.repository";
import type { BionicleSet, Wave } from "@/domain/sets";
import { RecommendationViewModel } from "@/domain/view-models/recommendation.view-model";
import { SetViewModel } from "@/domain/view-models/set.view-model";

const RECOMMENDATION_WEIGHTS = {
  yearCompletion: 100,
  wishlist: 100,
  waveCompletion: 60,
  discoveryYear: 15,
  discoveryWave: 10,
  averageRating: 20,
} as const;

type ScopeCounts = {
  totalsByYear: Map<string, number>;
  ownedByYear: Map<string, number>;
  totalsByWave: Map<Wave, number>;
  ownedByWave: Map<Wave, number>;
};

export class RecommendationsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly userCollectionRepository: UserCollectionRepositoryPort,
    private readonly setRatingRepository: SetRatingRepositoryPort,
    private readonly userWishlistRepository: UserWishlistRepositoryPort,
  ) {}

  // TODO: this should probably be cached
  async getRecommendations(
    userId: string,
    limit = 20, // TODO: pagination
  ): Promise<RecommendationViewModel[]> {
    const [collectionSetNumbers, ratingsBySet, averageRatings, wishlistState] =
      await Promise.all([
        this.userCollectionRepository.getUserCollection(userId),
        this.setRatingRepository.getUserRatings(userId),
        this.setRatingRepository.getAverageRatings(),
        this.userWishlistRepository.getWishlistState(userId),
      ]);

    const allSets = this.setsRepository.getAll();
    const setViewModels = allSets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers,
        ratingsBySet,
        averageRatings,
        wishlistState,
      }),
    );

    const candidates = setViewModels.filter(
      (set) => !set.isInCollection && !set.notInterested,
    );
    if (candidates.length === 0) {
      return [];
    }

    const scopeCounts = this.buildScopeCounts(
      allSets,
      new Set(collectionSetNumbers),
    );
    const scored = candidates.map((set) => this.scoreSet(set, scopeCounts));

    return scored
      .toSorted((a, b) => {
        const byScore = b.score - a.score;
        if (byScore !== 0) {
          return byScore;
        }

        const byWishlist = Number(b.set.wishlisted) - Number(a.set.wishlisted);
        if (byWishlist !== 0) {
          return byWishlist;
        }

        const byRating =
          Number(b.set.averageRating ?? 0) - Number(a.set.averageRating ?? 0);
        if (byRating !== 0) {
          return byRating;
        }

        return a.set.catalogNumber.localeCompare(b.set.catalogNumber);
      })
      .slice(0, limit);
  }

  private buildScopeCounts(
    allSets: BionicleSet[],
    collectionSetNumbers: Set<string>,
  ): ScopeCounts {
    const totalsByYear = new Map<string, number>();
    const ownedByYear = new Map<string, number>();
    const totalsByWave = new Map<Wave, number>();
    const ownedByWave = new Map<Wave, number>();

    for (const set of allSets) {
      totalsByYear.set(
        set.releaseYear,
        (totalsByYear.get(set.releaseYear) ?? 0) + 1,
      );
      totalsByWave.set(set.wave, (totalsByWave.get(set.wave) ?? 0) + 1);

      if (!collectionSetNumbers.has(set.catalogNumber)) {
        continue;
      }

      ownedByYear.set(
        set.releaseYear,
        (ownedByYear.get(set.releaseYear) ?? 0) + 1,
      );
      ownedByWave.set(set.wave, (ownedByWave.get(set.wave) ?? 0) + 1);
    }

    return {
      totalsByYear,
      ownedByYear,
      totalsByWave,
      ownedByWave,
    };
  }

  private scoreSet(
    set: SetViewModel,
    scopeCounts: ScopeCounts,
  ): RecommendationViewModel {
    let score = 0;
    const reasons: string[] = [];

    const waveOwned = scopeCounts.ownedByWave.get(set.wave) ?? 0;
    const waveTotal = scopeCounts.totalsByWave.get(set.wave) ?? 0;
    const waveMissing = Math.max(0, waveTotal - waveOwned);

    const yearOwned = scopeCounts.ownedByYear.get(set.releaseYear) ?? 0;
    const yearTotal = scopeCounts.totalsByYear.get(set.releaseYear) ?? 0;
    const yearMissing = Math.max(0, yearTotal - yearOwned);

    if (set.wishlisted) {
      score += RECOMMENDATION_WEIGHTS.wishlist;
      reasons.push("On your wishlist");
    }

    if (yearOwned > 0 && yearMissing > 0) {
      score += RECOMMENDATION_WEIGHTS.yearCompletion / yearMissing;
      reasons.push(
        `Only ${yearMissing} set${yearMissing === 1 ? "" : "s"} left to complete ${set.releaseYear}`,
      );
    }

    if (waveOwned > 0 && waveMissing > 0) {
      score += RECOMMENDATION_WEIGHTS.waveCompletion / waveMissing;
      reasons.push(
        `Only ${waveMissing} set${waveMissing === 1 ? "" : "s"} left to complete ${set.wave}`,
      );
    }

    if (yearOwned === 0) {
      score += RECOMMENDATION_WEIGHTS.discoveryYear;
      reasons.push(
        `Check out ${set.releaseYear} - you don't have any sets from this year yet`,
      );
    }

    if (waveOwned === 0) {
      score += RECOMMENDATION_WEIGHTS.discoveryWave;
      reasons.push(
        `Check out ${set.wave} - you don't have any sets from this wave yet`,
      );
    }

    if (set.averageRating) {
      const NEUTRAL_RATING = 3;
      // Below 3: penalize; at 3: neutral; above 3: promote.
      const ratingContribution =
        (set.averageRating - NEUTRAL_RATING) *
        RECOMMENDATION_WEIGHTS.averageRating;
      score += ratingContribution;
      if (ratingContribution > 0) {
        reasons.push(`Community rating: ${set.averageRating.toFixed(1)}/5`);
      }
    }

    return new RecommendationViewModel(set, score, reasons);
  }
}
