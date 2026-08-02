import { type BionicleSet, SetType, Wave } from "@/domain/sets";
import type { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";

export function setFixture(
  overrides: Partial<BionicleSet> &
    Pick<BionicleSet, "catalogNumber" | "name" | "releaseYear" | "wave">,
): BionicleSet {
  return {
    setType: SetType.CANISTER,
    imageName: "test.png",
    ...overrides,
  };
}

type SetViewModelFixtureContext = {
  inCollection?: boolean;
  addedToCollectionAt?: Date;
  userRating?: number;
  averageRating?: number;
  wishlistScale?: UserWishlistScale;
};

export function setViewModelFixture(
  overrides: Partial<BionicleSet> & Pick<BionicleSet, "catalogNumber">,
  context: SetViewModelFixtureContext = {},
): SetViewModel {
  const set = setFixture({
    name: "Test set",
    releaseYear: "2001",
    wave: Wave.TOA_MATA,
    ...overrides,
  });

  const userCollectionBySet = context.addedToCollectionAt
    ? { [set.catalogNumber]: context.addedToCollectionAt }
    : context.inCollection
      ? { [set.catalogNumber]: new Date() }
      : {};

  return SetViewModel.build({
    set,
    userCollectionBySet,
    userRatings:
      context.userRating !== undefined
        ? { [set.catalogNumber]: context.userRating }
        : {},
    averageRatings:
      context.averageRating !== undefined
        ? { [set.catalogNumber]: context.averageRating }
        : {},
    userWishlistState:
      context.wishlistScale !== undefined
        ? { [set.catalogNumber]: context.wishlistScale }
        : {},
  });
}
