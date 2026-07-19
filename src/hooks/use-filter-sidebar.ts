"use client";

import { useUser } from "@stackframe/stack";
import { useQueryStates } from "nuqs";
import { filterParamDescriptors } from "@/components/sets/set-filter-params";
import type {
  CollectionFilterValue,
  RatingFilterValue,
  ReleaseYear,
  WishlistFilterValue,
} from "@/domain/set-filter";
import type { BionicleCharacter, SetType, Wave } from "@/domain/sets";

export type SetFilterParams = {
  years: ReleaseYear[];
  types: SetType[];
  waves: Wave[];
  characters: BionicleCharacter[];
  collection: CollectionFilterValue | null;
  wishlist: WishlistFilterValue[];
  userRatings: RatingFilterValue[];
  averageRatings: RatingFilterValue[];
};

type UseFilterSidebarOptions = {
  onSearchChange: (value: string | null) => void;
};

export function useFilterSidebar({ onSearchChange }: UseFilterSidebarOptions) {
  const [filterParams, setFilterParams] = useQueryStates(
    filterParamDescriptors,
  );

  const isSignedIn = !!useUser();

  const hasActiveFilters =
    filterParams.years.length > 0 ||
    filterParams.types.length > 0 ||
    filterParams.waves.length > 0 ||
    filterParams.characters.length > 0 ||
    filterParams.averageRatings.length > 0 ||
    (isSignedIn &&
      (filterParams.collection !== null ||
        filterParams.wishlist.length > 0 ||
        filterParams.userRatings.length > 0));

  const activeArrayFilterCount = [
    filterParams.years,
    filterParams.types,
    filterParams.waves,
    filterParams.characters,
    filterParams.averageRatings,
    ...(isSignedIn ? [filterParams.wishlist, filterParams.userRatings] : []),
  ].filter((values) => values.length > 0).length;

  const activeFilterCount =
    activeArrayFilterCount +
    (isSignedIn && filterParams.collection !== null ? 1 : 0);

  const handleChange = (patch: Partial<SetFilterParams>) => {
    const next = { ...filterParams, ...patch };
    setFilterParams({
      years: next.years.length > 0 ? next.years : null,
      types: next.types.length > 0 ? next.types : null,
      waves: next.waves.length > 0 ? next.waves : null,
      characters: next.characters.length > 0 ? next.characters : null,
      collection: next.collection,
      wishlist: next.wishlist.length > 0 ? next.wishlist : null,
      userRatings: next.userRatings.length > 0 ? next.userRatings : null,
      averageRatings:
        next.averageRatings.length > 0 ? next.averageRatings : null,
    });
  };

  const handleClear = () => {
    setFilterParams({
      years: null,
      types: null,
      waves: null,
      characters: null,
      collection: null,
      wishlist: null,
      userRatings: null,
      averageRatings: null,
    });
    onSearchChange(null);
  };

  return {
    filterParams,
    handleChange,
    handleClear,
    hasActiveFilters,
    activeFilterCount,
  };
}
