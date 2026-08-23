import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { setsClient } from "@/clients/sets.client";
import { useDebounce } from "@/hooks/use-debounce";

const SEARCH_DEBOUNCE_MS = 300;

export function useSetsSearch(query: string) {
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const trimmed = debouncedQuery.trim();
  const hasQuery = query.trim().length > 0;

  const queryResult = useQuery({
    queryKey: ["sets-search", trimmed],
    queryFn: () => setsClient.searchSets(trimmed),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    results: hasQuery ? (queryResult.data?.sets ?? []) : [],
    totalCount: hasQuery ? (queryResult.data?.totalCount ?? 0) : 0,
  };
}
