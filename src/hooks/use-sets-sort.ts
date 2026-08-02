import { useUser } from "@stackframe/stack";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { useMemo } from "react";
import {
  SetSort,
  type SortDirection,
  type SortOption,
} from "@/domain/set-sort";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";

type UseSetsSortOptions = {
  sets: SetViewModel[];
  totalCount: number;
  defaultSort?: SortOption;
  defaultDir?: SortDirection;
  displayCollectionCounts?: boolean;
};

export function useSetsSort({
  sets,
  totalCount,
  defaultSort = "year-wave",
  defaultDir = "asc",
  displayCollectionCounts = false,
}: UseSetsSortOptions) {
  const sortDescriptors = useMemo(
    () => ({
      sort: parseAsStringLiteral(SetSort.OPTIONS).withDefault(defaultSort),
      dir: parseAsStringLiteral(SetSort.DIRECTIONS).withDefault(defaultDir),
    }),
    [defaultSort, defaultDir],
  );

  const [sortParams, setSortParams] = useQueryStates(sortDescriptors, {
    shallow: true,
  });

  const user = useUser();
  const isSignedIn = !!user;

  const grouped: SetsGroupedViewModel = useMemo(() => {
    return new SetSort(
      sortParams.sort,
      sortParams.dir,
      isSignedIn,
      displayCollectionCounts,
    ).sort({
      sets,
      totalCount,
    });
  }, [
    sets,
    totalCount,
    sortParams.sort,
    sortParams.dir,
    isSignedIn,
    displayCollectionCounts,
  ]);

  const setSort = (sort: SortOption, dir: SortDirection) => {
    setSortParams({ sort, dir });
  };

  const setDir = (dir: SortDirection) => {
    setSortParams({ dir });
  };

  return {
    sort: sortParams.sort,
    dir: sortParams.dir,
    setSort,
    setDir,
    grouped,
  };
}
