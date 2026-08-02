"use client";

import { SetFilterSidebar } from "@/components/sets/set-filter-sidebar";
import { SetSearchBar } from "@/components/sets/set-search-bar";
import { SetSortBar } from "@/components/sets/set-sort-bar";
import { SetsGroupedVirtualList } from "@/components/sets/sets-grouped-virtual-list";
import { PageTitle } from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import type { SortDirection, SortOption } from "@/domain/set-sort";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { useSetsFilter } from "@/hooks/use-sets-filter";
import { useSetsSort } from "@/hooks/use-sets-sort";

type SetsListProps = {
  viewModel: SetsListViewModel;
  showFilterSidebar?: boolean;
  pageTitle?: string;
  pageTitleSubtitle?: string;
  defaultSort?: SortOption;
  defaultDir?: SortDirection;
  displayCollectionCounts?: boolean;
};

export function SetsList({
  viewModel,
  showFilterSidebar = false,
  pageTitle,
  pageTitleSubtitle,
  defaultSort,
  defaultDir,
  displayCollectionCounts = false,
}: SetsListProps) {
  const { query, setQuery, filteredSets, isFiltering, hasResults } =
    useSetsFilter({
      viewModel,
      structuredFiltersEnabled: showFilterSidebar,
    });
  const { sort, dir, setSort, setDir, grouped } = useSetsSort({
    sets: filteredSets,
    totalCount: viewModel.totalCount,
    defaultSort,
    defaultDir,
    displayCollectionCounts,
  });

  const listContent = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <SetSortBar
          sort={sort}
          dir={dir}
          onSortChange={setSort}
          onDirectionChange={setDir}
        />
        {isFiltering && (
          <p className="text-sm">
            <MutedText>
              Showing {filteredSets.length} of {viewModel.totalCount} sets
            </MutedText>
          </p>
        )}
      </div>
      {isFiltering && !hasResults ? (
        <p className="text-muted">No sets found for the current filters.</p>
      ) : (
        <SetsGroupedVirtualList viewModel={grouped} />
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

      <div className="min-w-0 flex-1">
        {pageTitle ? (
          <PageTitle subtitle={pageTitleSubtitle}>{pageTitle}</PageTitle>
        ) : null}
        {listContent}
      </div>
    </div>
  );
}
