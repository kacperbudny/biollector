import { useUser } from "@stackframe/stack";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useMemo } from "react";
import { filterParamDescriptors } from "@/components/sets/set-filter-params";
import { SetFilter } from "@/domain/set-filter";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { useDebounce } from "@/hooks/use-debounce";

const FILTER_DEBOUNCE_MS = 300;

type UseSetsFilterOptions = {
  viewModel: SetsListViewModel;
  structuredFiltersEnabled?: boolean;
};

export function useSetsFilter({
  viewModel,
  structuredFiltersEnabled = false,
}: UseSetsFilterOptions) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ throttleMs: FILTER_DEBOUNCE_MS, shallow: true }),
  );

  const [filterParams] = useQueryStates(filterParamDescriptors);

  const user = useUser();
  const isSignedIn = !!user;

  const debouncedQuery = useDebounce(query, FILTER_DEBOUNCE_MS);

  const filteredSets: SetViewModel[] = useMemo(() => {
    const userFiltersEnabled = structuredFiltersEnabled && isSignedIn;
    const filterState = {
      query: debouncedQuery,
      years: structuredFiltersEnabled ? filterParams.years : [],
      types: structuredFiltersEnabled ? filterParams.types : [],
      waves: structuredFiltersEnabled ? filterParams.waves : [],
      characters: structuredFiltersEnabled ? filterParams.characters : [],
      collection: userFiltersEnabled ? filterParams.collection : null,
      wishlist: userFiltersEnabled ? filterParams.wishlist : [],
      userRatings: userFiltersEnabled ? filterParams.userRatings : [],
      averageRatings: structuredFiltersEnabled
        ? filterParams.averageRatings
        : [],
    };
    return new SetFilter(filterState).filter(viewModel.sets);
  }, [
    debouncedQuery,
    filterParams.years,
    filterParams.types,
    filterParams.waves,
    filterParams.characters,
    filterParams.collection,
    filterParams.wishlist,
    filterParams.userRatings,
    filterParams.averageRatings,
    viewModel.sets,
    structuredFiltersEnabled,
    isSignedIn,
  ]);

  const hasQuery = debouncedQuery.trim().length > 0;

  const hasStructuredFilters =
    filterParams.years.length > 0 ||
    filterParams.types.length > 0 ||
    filterParams.waves.length > 0 ||
    filterParams.characters.length > 0 ||
    filterParams.averageRatings.length > 0;

  const hasUserFilters =
    isSignedIn &&
    (filterParams.collection !== null ||
      filterParams.wishlist.length > 0 ||
      filterParams.userRatings.length > 0);

  const isFiltering =
    hasQuery ||
    (structuredFiltersEnabled && (hasStructuredFilters || hasUserFilters));

  const hasResults = filteredSets.length > 0;

  return {
    query,
    setQuery,
    filteredSets,
    isFiltering,
    hasResults,
  };
}
