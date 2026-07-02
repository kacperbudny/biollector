"use client";

import { SetFilterSidebar } from "@/components/sets/set-filter-sidebar";
import { SetSearchBar } from "@/components/sets/set-search-bar";
import { SetsGroupedVirtualList } from "@/components/sets/sets-grouped-virtual-list";
import { MutedText } from "@/components/typography/text";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import { useSetsFilter } from "@/hooks/use-sets-filter";

type SetsListProps = {
  viewModel: SetsGroupedViewModel;
  showFilterSidebar?: boolean;
};

export function SetsList({
  viewModel,
  showFilterSidebar = false,
}: SetsListProps) {
  const { query, setQuery, filtered, isFiltering, hasResults } = useSetsFilter({
    viewModel,
    structuredFiltersEnabled: showFilterSidebar,
  });

  const listContent = (
    <>
      {isFiltering && (
        <p className="mb-4 text-sm">
          <MutedText>
            Showing {filtered.totalCount} of {viewModel.totalCount} sets
          </MutedText>
        </p>
      )}
      {isFiltering && !hasResults ? (
        <p className="text-muted">No sets found for the current filters.</p>
      ) : (
        <SetsGroupedVirtualList viewModel={filtered} />
      )}
    </>
  );

  // TODO: remove this once all pages have the filter sidebar
  if (!showFilterSidebar) {
    return (
      <>
        <SetSearchBar value={query} onChange={(v) => setQuery(v || null)} />
        {listContent}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <SetFilterSidebar
        searchValue={query}
        onSearchChange={(v) => setQuery(v || null)}
      />

      <div className="min-w-0 flex-1">{listContent}</div>
    </div>
  );
}
