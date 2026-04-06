import type { BionicleSet, SetType, Wave } from "@/domain/sets";
import { UserWishlistScale } from "@/domain/user-wishlist";

export class SetViewModel {
  constructor(
    public readonly catalogNumber: string,
    public readonly name: string,
    public readonly releaseYear: string,
    public readonly setType: SetType,
    public readonly imageName: string,
    public readonly wave: Wave,
    public readonly characters: BionicleSet["characters"],
    public readonly minifigures: BionicleSet["minifigures"],
    public readonly isInCollection: boolean,
    public readonly wishlisted: boolean,
    public readonly notInterested: boolean,
    public readonly userRating?: number,
    public readonly averageRating?: number,
  ) {}

  static fromBionicleSet({
    set,
    collectionSetNumbers,
    userRatings,
    averageRatings,
    userWishlistState,
  }: {
    set: BionicleSet;
    collectionSetNumbers: string[];
    userRatings: Record<string, number>;
    averageRatings: Record<string, number>;
    userWishlistState: Record<string, number>;
  }): SetViewModel {
    const scale = userWishlistState[set.catalogNumber];
    return new SetViewModel(
      set.catalogNumber,
      set.name,
      set.releaseYear,
      set.setType,
      set.imageName,
      set.wave,
      set.characters,
      set.minifigures,
      collectionSetNumbers.includes(set.catalogNumber),
      scale === UserWishlistScale.WISHLISTED,
      scale === UserWishlistScale.NOT_INTERESTED,
      userRatings[set.catalogNumber],
      averageRatings[set.catalogNumber],
    );
  }
}
