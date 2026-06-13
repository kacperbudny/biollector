"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { SetSearchBar } from "@/components/sets/set-search-bar";
import { SetsGroupedVirtualList } from "@/components/sets/sets-grouped-virtual-list";
import { MutedText } from "@/components/typography/text";
import { SetSearch } from "@/domain/set-search";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { useDebounce } from "@/hooks/use-debounce";

const FILTER_DEBOUNCE_MS = 300;

type SetsListProps = {
  viewModel: SetsGroupedViewModel;
};

export function SetsList({ viewModel }: SetsListProps) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ throttleMs: FILTER_DEBOUNCE_MS, shallow: true }),
  );

  const debouncedQuery = useDebounce(query, FILTER_DEBOUNCE_MS);

  const filtered = useMemo(
    () => new SetSearch(debouncedQuery).filter(viewModel),
    [debouncedQuery, viewModel],
  );
  const isFiltering = debouncedQuery.trim().length > 0;
  const hasResults = filtered.totalCount > 0;

  return (
    <>
      <SetSearchBar value={query} onChange={(v) => setQuery(v || null)} />
      {isFiltering && (
        <p className="mb-4 text-sm">
          <MutedText>
            Showing {filtered.totalCount} of {viewModel.totalCount} sets
          </MutedText>
        </p>
      )}
      {isFiltering && !hasResults ? (
        <p className="text-muted">
          No sets found for &ldquo;{debouncedQuery}&rdquo;.
        </p>
      ) : (
        <SetsGroupedVirtualList viewModel={filtered} />
      )}
    </>
  );
}
