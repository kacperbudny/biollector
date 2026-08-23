import { useQuery } from "@tanstack/react-query";
import { setsClient } from "@/clients/sets.client";
import { useDebounce } from "@/hooks/use-debounce";

const SEARCH_DEBOUNCE_MS = 300;

export function useSetsSearch(query: string) {
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const trimmed = debouncedQuery.trim();
  const liveTrimmed = query.trim();
  const hasQuery = liveTrimmed.length > 0;
  const isDebouncing = hasQuery && liveTrimmed !== trimmed;

  const queryResult = useQuery({
    queryKey: ["sets-search", trimmed],
    queryFn: () => setsClient.searchSets(trimmed),
    enabled: trimmed.length > 0,
  });

  const dataMatchesLiveQuery = hasQuery && !isDebouncing;

  return {
    ...queryResult,
    results: dataMatchesLiveQuery ? (queryResult.data?.sets ?? []) : [],
    totalCount: dataMatchesLiveQuery ? (queryResult.data?.totalCount ?? 0) : 0,
    isSearching: isDebouncing || queryResult.isFetching,
  };
}
