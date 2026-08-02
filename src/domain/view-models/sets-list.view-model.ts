import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type SetsListViewModel = {
  sets: SetViewModel[];
  totalCount: number;
};
