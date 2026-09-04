import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

export const FALLBACK_PROFILE_DISPLAY_NAME = "Collector";

export type UserProfileViewModel = {
  displayName: string;
  collection: SetsListViewModel;
  wishlist: SetsListViewModel;
};

export namespace UserProfileViewModel {
  export function from({
    displayName,
    collection,
    wishlist,
  }: {
    displayName: string | null;
    collection: SetsListViewModel;
    wishlist: SetsListViewModel;
  }): UserProfileViewModel {
    return {
      displayName: resolveDisplayName(displayName),
      collection,
      wishlist,
    };
  }
}

function resolveDisplayName(displayName: string | null): string {
  const trimmed = displayName?.trim();
  return trimmed ? trimmed : FALLBACK_PROFILE_DISPLAY_NAME;
}
