import type { BionicleSet, SetType, Wave } from "@/domain/sets";
import {
  UserWishlistScale,
  userWishlistScaleSchema,
} from "@/domain/user-wishlist";

export class SetViewModel {
  private static readonly WISHLIST_SCALE_LABELS: Record<
    UserWishlistScale,
    string
  > = {
    [UserWishlistScale.NOT_INTERESTED]: "Not interested",
    [UserWishlistScale.VERY_LOW]: "Very low priority",
    [UserWishlistScale.LOW]: "Low priority",
    [UserWishlistScale.MEDIUM]: "Medium priority",
    [UserWishlistScale.HIGH]: "High priority",
    [UserWishlistScale.MUST_HAVE]: "Must have",
  };

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
    public readonly wishlistScale: UserWishlistScale | null,
    public readonly userRating?: number,
    public readonly averageRating?: number,
  ) {
    if (wishlistScale !== null) {
      userWishlistScaleSchema.parse(wishlistScale);
    }
  }

  static getWishlistScaleLabel(scale: UserWishlistScale): string {
    return SetViewModel.WISHLIST_SCALE_LABELS[scale];
  }

  get wishlisted(): boolean {
    return (
      this.wishlistScale !== null &&
      this.wishlistScale !== UserWishlistScale.NOT_INTERESTED
    );
  }

  get notInterested(): boolean {
    return this.wishlistScale === UserWishlistScale.NOT_INTERESTED;
  }

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
      userWishlistState[set.catalogNumber] ?? null,
      userRatings[set.catalogNumber],
      averageRatings[set.catalogNumber],
    );
  }
}
