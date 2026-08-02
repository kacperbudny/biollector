import type { SetViewModel } from "@/domain/view-models/set.view-model";

export type SetGroup = {
  label: string;
  sets: SetViewModel[];
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

export type FlatSetSection = {
  label?: string;
  sets: SetViewModel[];
};

export type NestedSetSection = {
  label: string;
  groups: SetGroup[];
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

export type SetSection = FlatSetSection | NestedSetSection;

export type SetsGroupedViewModel = {
  sections: SetSection[];
  totalCount: number;
  collectionCount?: number;
};
