import type { BionicleSet, SetType, Wave } from "@/domain/sets";
import {
  UserWishlistScale,
  userWishlistScaleSchema,
} from "@/domain/user-wishlist";

export type SetViewModel = {
  catalogNumber: string;
  name: string;
  releaseYear: string;
  setType: SetType;
  imageName: string;
  wave: Wave;
  characters: BionicleSet["characters"];
  minifigures: BionicleSet["minifigures"];
  isInCollection: boolean;
  wishlistScale: UserWishlistScale | null;
  wishlisted: boolean;
  notInterested: boolean;
  userRating?: number;
  averageRating?: number;
};

export namespace SetViewModel {
  export function build({
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
    const wishlistScale =
      (userWishlistState[set.catalogNumber] as UserWishlistScale) ?? null;

    if (wishlistScale !== null) {
      userWishlistScaleSchema.parse(wishlistScale);
    }

    return {
      catalogNumber: set.catalogNumber,
      name: set.name,
      releaseYear: set.releaseYear,
      setType: set.setType,
      imageName: set.imageName,
      wave: set.wave,
      characters: set.characters,
      minifigures: set.minifigures,
      isInCollection: collectionSetNumbers.includes(set.catalogNumber),
      wishlistScale,
      wishlisted:
        wishlistScale !== null &&
        wishlistScale !== UserWishlistScale.NOT_INTERESTED,
      notInterested: wishlistScale === UserWishlistScale.NOT_INTERESTED,
      userRating: userRatings[set.catalogNumber],
      averageRating: averageRatings[set.catalogNumber],
    };
  }
}
