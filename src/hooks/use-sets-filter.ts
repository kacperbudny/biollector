import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useMemo } from "react";
import { filterParamDescriptors } from "@/components/sets/set-filter-params";
import { SetFilter } from "@/domain/set-filter";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { useDebounce } from "@/hooks/use-debounce";

const FILTER_DEBOUNCE_MS = 300;

type UseSetsFilterOptions = {
  viewModel: SetsGroupedViewModel;
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

  const debouncedQuery = useDebounce(query, FILTER_DEBOUNCE_MS);

  const filtered = useMemo(() => {
    const filterState = {
      query: debouncedQuery,
      years: structuredFiltersEnabled ? filterParams.years : [],
      types: structuredFiltersEnabled ? filterParams.types : [],
      waves: structuredFiltersEnabled ? filterParams.waves : [],
      characters: structuredFiltersEnabled ? filterParams.characters : [],
    };
    return new SetFilter(filterState).filter(viewModel);
  }, [
    debouncedQuery,
    filterParams.years,
    filterParams.types,
    filterParams.waves,
    filterParams.characters,
    viewModel,
    structuredFiltersEnabled,
  ]);

  const isFiltering =
    debouncedQuery.trim().length > 0 ||
    (structuredFiltersEnabled &&
      (filterParams.years.length > 0 ||
        filterParams.types.length > 0 ||
        filterParams.waves.length > 0 ||
        filterParams.characters.length > 0));

  const hasResults = filtered.totalCount > 0;

  return {
    query,
    setQuery,
    filtered,
    isFiltering,
    hasResults,
  };
}
