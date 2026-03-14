import type { BionicleSet, SetType, Wave } from "@/domain/sets";

export class SetViewModel implements BionicleSet {
  constructor(
    public readonly catalogNumber: string,
    public readonly name: string,
    public readonly releaseYear: string,
    public readonly setType: SetType,
    public readonly imageName: string,
    public readonly wave: Wave,
    public readonly isInCollection: boolean,
    public readonly wishlisted: boolean,
    public readonly userRating?: number,
    public readonly averageRating?: number,
  ) {}

  static fromBionicleSet({
    set,
    collectionSetNumbers,
    ratingsBySet,
    averageRatings,
    wishlistSetNumbers,
  }: {
    set: BionicleSet;
    collectionSetNumbers: string[];
    ratingsBySet: Record<string, number>;
    averageRatings: Record<string, number>;
    wishlistSetNumbers: string[];
  }): SetViewModel {
    return new SetViewModel(
      set.catalogNumber,
      set.name,
      set.releaseYear,
      set.setType,
      set.imageName,
      set.wave,
      collectionSetNumbers.includes(set.catalogNumber),
      wishlistSetNumbers.includes(set.catalogNumber),
      ratingsBySet[set.catalogNumber],
      averageRatings[set.catalogNumber],
    );
  }
}
