import type { SetsRepository } from "@/data/repositories/sets.repository";
import type { SetViewModelContextLoader } from "@/domain/set-view-model.context-loader";
import type { BionicleCharacter, BionicleSet, Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { RecommendationViewModel } from "@/domain/view-models/recommendation.view-model";
import { SetViewModel } from "@/domain/view-models/set.view-model";

const NO_VARIATION_KEY = "__NO_VARIATION__";

export type RecommendationWeights = {
  yearCompletion: number;
  wishlist: number;
  waveCompletion: number;
  characterCompletion: number;
  discoveryYear: number;
  discoveryWave: number;
  discoveryCharacter: number;
  generationCompletion: number;
  generationDiscovery: number;
  averageRating: number;
};

const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  yearCompletion: 100,
  wishlist: 100,
  waveCompletion: 60,
  characterCompletion: 80,
  discoveryYear: 15,
  discoveryWave: 10,
  discoveryCharacter: 5,
  generationCompletion: 150,
  generationDiscovery: 20,
  averageRating: 20,
};

type CharacterScopeCounts = {
  totalsByCharacter: Map<BionicleCharacter, number>;
  ownedByCharacter: Map<BionicleCharacter, number>;
  totalMinifigureVersionsByCharacter: Map<BionicleCharacter, Set<string>>;
  ownedMinifigureVersionsByCharacter: Map<BionicleCharacter, Set<string>>;
  discoveredCharactersInOwnedSets: Set<BionicleCharacter>;
};

type GenerationScopeCounts = {
  g1Total: number;
  g1Owned: number;
  g2Total: number;
  g2Owned: number;
};

type ScopeCounts = {
  totalsByYear: Map<string, number>;
  ownedByYear: Map<string, number>;
  totalsByWave: Map<Wave, number>;
  ownedByWave: Map<Wave, number>;
} & CharacterScopeCounts &
  GenerationScopeCounts;

export class RecommendationsService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setViewModelContextLoader: SetViewModelContextLoader,
    private readonly recommendationWeights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
  ) {}

  // TODO: this should probably be cached
  async getRecommendations(
    userId: string,
    limit = 20, // TODO: pagination
  ): Promise<RecommendationViewModel[]> {
    const ctx = await this.setViewModelContextLoader.load({ userId });
    const allSets = this.setsRepository.getAll();
    const setViewModels = allSets.map((set) =>
      SetViewModel.fromBionicleSet({
        set,
        collectionSetNumbers: ctx.collectionSetNumbers,
        userRatings: ctx.userRatingsBySet,
        averageRatings: ctx.averageRatingsBySet,
        userWishlistState: ctx.userWishlistStateBySet,
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
      ctx.collectionSetNumbers,
      ctx.userWishlistStateBySet,
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
    collectionSetNumbers: string[],
    wishlistState: Record<string, number>,
  ): ScopeCounts {
    const effectiveOwnedCatalogNumbers = this.buildEffectiveOwnedSet(
      collectionSetNumbers,
      wishlistState,
    );
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

      if (!effectiveOwnedCatalogNumbers.has(set.catalogNumber)) {
        continue;
      }

      ownedByYear.set(
        set.releaseYear,
        (ownedByYear.get(set.releaseYear) ?? 0) + 1,
      );
      ownedByWave.set(set.wave, (ownedByWave.get(set.wave) ?? 0) + 1);
    }

    const characterScopeCounts = this.buildCharacterScopeCounts(
      allSets,
      effectiveOwnedCatalogNumbers,
    );
    const generationScopeCounts = this.buildGenerationScopeCounts(
      allSets,
      effectiveOwnedCatalogNumbers,
    );

    return {
      totalsByYear,
      ownedByYear,
      totalsByWave,
      ownedByWave,
      ...characterScopeCounts,
      ...generationScopeCounts,
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
      score += this.recommendationWeights.wishlist;
      reasons.push("On your wishlist");
    }

    if (this.canApplyYearCompletion(yearOwned, yearMissing)) {
      score += this.recommendationWeights.yearCompletion / yearMissing;
      reasons.push(
        `Only ${yearMissing} set${yearMissing === 1 ? "" : "s"} left to complete ${set.releaseYear}`,
      );
    }

    if (this.canApplyWaveCompletion(waveOwned, waveTotal, waveMissing)) {
      score += this.recommendationWeights.waveCompletion / waveMissing;
      reasons.push(
        `Only ${waveMissing} set${waveMissing === 1 ? "" : "s"} left to complete ${set.wave}`,
      );
    }

    if (yearOwned === 0) {
      score += this.recommendationWeights.discoveryYear;
      reasons.push(
        `Check out ${set.releaseYear} - you don't have any sets from this year yet`,
      );
    }

    if (waveOwned === 0) {
      score += this.recommendationWeights.discoveryWave;
      reasons.push(
        `Check out ${set.wave} - you don't have any sets from this wave yet`,
      );
    }

    this.addCharacterCompletionScore(set, scopeCounts, reasons, (points) => {
      score += points;
    });
    this.addCharacterDiscoveryScore(set, scopeCounts, reasons, (points) => {
      score += points;
    });
    this.addGenerationCompletionAndDiscoveryScore(
      set,
      scopeCounts,
      reasons,
      (points) => {
        score += points;
      },
    );

    if (set.averageRating) {
      const NEUTRAL_RATING = 3;
      // Below 3: penalize; at 3: neutral; above 3: promote.
      const ratingContribution =
        (set.averageRating - NEUTRAL_RATING) *
        this.recommendationWeights.averageRating;
      score += ratingContribution;
      if (ratingContribution > 0) {
        reasons.push(`Community rating: ${set.averageRating.toFixed(1)}/5`);
      }
    }

    return new RecommendationViewModel(set, score, reasons);
  }

  private addCharacterCompletionScore(
    set: SetViewModel,
    scopeCounts: ScopeCounts,
    reasons: string[],
    addScore: (score: number) => void,
  ): void {
    const qualifyingCharacters: Array<{
      character: BionicleCharacter;
      missingVersions: number;
    }> = [];

    for (const character of this.getCandidateCharacters(set)) {
      const totalCharacterOccurrences =
        scopeCounts.totalsByCharacter.get(character) ?? 0;
      const ownedCharacterOccurrences =
        scopeCounts.ownedByCharacter.get(character) ?? 0;
      const totalMinifigureVariations =
        scopeCounts.totalMinifigureVersionsByCharacter.get(character)?.size ??
        0;
      const ownedMinifigureVariations =
        scopeCounts.ownedMinifigureVersionsByCharacter.get(character)?.size ??
        0;
      const totalVersions =
        totalCharacterOccurrences + totalMinifigureVariations;
      const ownedVersions =
        ownedCharacterOccurrences + ownedMinifigureVariations;
      const missingVersions = Math.max(0, totalVersions - ownedVersions);

      if (
        !this.canApplyCharacterCompletion(
          ownedVersions,
          totalVersions,
          missingVersions,
        )
      ) {
        continue;
      }

      if (!this.hasCandidateVersionForCharacter(set, character, scopeCounts)) {
        continue;
      }

      qualifyingCharacters.push({ character, missingVersions });
    }

    if (qualifyingCharacters.length === 0) {
      return;
    }

    const totalMissingVersions = qualifyingCharacters.reduce(
      (sum, item) => sum + item.missingVersions,
      0,
    );
    addScore(
      this.recommendationWeights.characterCompletion / totalMissingVersions,
    );

    for (const character of qualifyingCharacters) {
      reasons.push(
        `Only ${character.missingVersions} character version${character.missingVersions === 1 ? "" : "s"} left to complete ${character.character}`,
      );
    }
  }

  private addCharacterDiscoveryScore(
    set: SetViewModel,
    scopeCounts: ScopeCounts,
    reasons: string[],
    addScore: (score: number) => void,
  ): void {
    for (const character of this.getCandidateCharacters(set)) {
      if (!scopeCounts.discoveredCharactersInOwnedSets.has(character)) {
        addScore(this.recommendationWeights.discoveryCharacter);
        reasons.push(
          `Discover ${character} - you don't have any sets with this character yet`,
        );
      }
    }
  }

  private addGenerationCompletionAndDiscoveryScore(
    set: SetViewModel,
    scopeCounts: ScopeCounts,
    reasons: string[],
    addScore: (score: number) => void,
  ): void {
    if (this.isG1Year(set.releaseYear)) {
      const missing = Math.max(0, scopeCounts.g1Total - scopeCounts.g1Owned);
      if (this.canApplyGenerationCompletion(scopeCounts.g1Owned, missing)) {
        addScore(this.recommendationWeights.generationCompletion / missing);
        reasons.push(
          `Only ${missing} set${missing === 1 ? "" : "s"} left to complete G1`,
        );
      }
      if (scopeCounts.g1Owned === 0) {
        addScore(this.recommendationWeights.generationDiscovery);
        reasons.push(
          "Check out G1 - you don't have any sets from this generation yet",
        );
      }
      return;
    }

    if (this.isG2Year(set.releaseYear)) {
      const missing = Math.max(0, scopeCounts.g2Total - scopeCounts.g2Owned);
      if (this.canApplyGenerationCompletion(scopeCounts.g2Owned, missing)) {
        addScore(this.recommendationWeights.generationCompletion / missing);
        reasons.push(
          `Only ${missing} set${missing === 1 ? "" : "s"} left to complete G2`,
        );
      }
      if (scopeCounts.g2Owned === 0) {
        addScore(this.recommendationWeights.generationDiscovery);
        reasons.push(
          "Check out G2 - you don't have any sets from this generation yet",
        );
      }
    }
  }

  private buildEffectiveOwnedSet(
    collectionSetNumbers: string[],
    wishlistState: Record<string, number>,
  ): Set<string> {
    return new Set(
      collectionSetNumbers.filter(
        (catalogNumber) =>
          wishlistState[catalogNumber] !== UserWishlistScale.NOT_INTERESTED,
      ),
    );
  }

  private buildCharacterScopeCounts(
    allSets: BionicleSet[],
    effectiveOwnedCatalogNumbers: Set<string>,
  ): CharacterScopeCounts {
    const totalsByCharacter = new Map<BionicleCharacter, number>();
    const ownedByCharacter = new Map<BionicleCharacter, number>();
    const totalMinifigureVersionsByCharacter = new Map<
      BionicleCharacter,
      Set<string>
    >();
    const ownedMinifigureVersionsByCharacter = new Map<
      BionicleCharacter,
      Set<string>
    >();
    const discoveredCharactersInOwnedSets = new Set<BionicleCharacter>();

    for (const set of allSets) {
      const isOwned = effectiveOwnedCatalogNumbers.has(set.catalogNumber);
      if (set.characters) {
        for (const character of set.characters) {
          totalsByCharacter.set(
            character,
            (totalsByCharacter.get(character) ?? 0) + 1,
          );
          if (isOwned) {
            ownedByCharacter.set(
              character,
              (ownedByCharacter.get(character) ?? 0) + 1,
            );
            discoveredCharactersInOwnedSets.add(character);
          }
        }
      } else if (set.minifigures) {
        for (const minifigure of set.minifigures) {
          this.addCharacterVariation(
            totalMinifigureVersionsByCharacter,
            minifigure.character,
            minifigure.variation ?? NO_VARIATION_KEY,
          );
          if (isOwned) {
            this.addCharacterVariation(
              ownedMinifigureVersionsByCharacter,
              minifigure.character,
              minifigure.variation ?? NO_VARIATION_KEY,
            );
            discoveredCharactersInOwnedSets.add(minifigure.character);
          }
        }
      }
    }

    return {
      totalsByCharacter,
      ownedByCharacter,
      totalMinifigureVersionsByCharacter,
      ownedMinifigureVersionsByCharacter,
      discoveredCharactersInOwnedSets,
    };
  }

  private buildGenerationScopeCounts(
    allSets: BionicleSet[],
    effectiveOwnedCatalogNumbers: Set<string>,
  ): GenerationScopeCounts {
    let g1Total = 0;
    let g1Owned = 0;
    let g2Total = 0;
    let g2Owned = 0;

    for (const set of allSets) {
      const isOwned = effectiveOwnedCatalogNumbers.has(set.catalogNumber);
      if (this.isG1Year(set.releaseYear)) {
        g1Total += 1;
        if (isOwned) {
          g1Owned += 1;
        }
      } else if (this.isG2Year(set.releaseYear)) {
        g2Total += 1;
        if (isOwned) {
          g2Owned += 1;
        }
      }
    }

    return {
      g1Total,
      g1Owned,
      g2Total,
      g2Owned,
    };
  }

  private addCharacterVariation(
    map: Map<BionicleCharacter, Set<string>>,
    character: BionicleCharacter,
    variation: string,
  ): void {
    if (!map.has(character)) {
      map.set(character, new Set());
    }
    map.get(character)?.add(variation);
  }

  private isG1Year(releaseYear: string): boolean {
    const year = Number.parseInt(releaseYear, 10);
    return year >= 2001 && year <= 2010;
  }

  private isG2Year(releaseYear: string): boolean {
    const year = Number.parseInt(releaseYear, 10);
    return year >= 2015 && year <= 2016;
  }

  private canApplyWaveCompletion(
    owned: number,
    total: number,
    missing: number,
  ): boolean {
    return owned > 0 && missing > 0 && owned >= total / 2;
  }

  private canApplyYearCompletion(owned: number, missing: number): boolean {
    return owned > 0 && missing > 0 && missing <= 10;
  }

  private canApplyCharacterCompletion(
    owned: number,
    total: number,
    missing: number,
  ): boolean {
    return owned > 0 && missing > 0 && owned >= total / 2;
  }

  private canApplyGenerationCompletion(
    owned: number,
    missing: number,
  ): boolean {
    return owned > 0 && missing > 0 && missing <= 10;
  }

  private getCandidateCharacters(set: SetViewModel): Set<BionicleCharacter> {
    const candidateCharacters = new Set<BionicleCharacter>();
    if (set.characters) {
      for (const character of set.characters) {
        candidateCharacters.add(character);
      }
      return candidateCharacters;
    }

    if (set.minifigures) {
      for (const minifigure of set.minifigures) {
        candidateCharacters.add(minifigure.character);
      }
    }
    return candidateCharacters;
  }

  private hasCandidateVersionForCharacter(
    set: SetViewModel,
    character: BionicleCharacter,
    scopeCounts: ScopeCounts,
  ): boolean {
    if (set.characters) {
      return set.characters.includes(character);
    }

    if (!set.minifigures) {
      return false;
    }

    const candidateVariationKeys = new Set(
      set.minifigures
        .filter((minifigure) => minifigure.character === character)
        .map((minifigure) => minifigure.variation ?? NO_VARIATION_KEY),
    );
    const ownedVariationKeys =
      scopeCounts.ownedMinifigureVersionsByCharacter.get(character) ??
      new Set();
    return [...candidateVariationKeys].some(
      (variation) => !ownedVariationKeys.has(variation),
    );
  }
}
