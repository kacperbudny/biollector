"use client";

import { Tabs } from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { SetsList } from "@/components/sets/sets-list";
import type { SortDirection, SortOption } from "@/domain/set-sort";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";

type UserProfileTabsProps = {
  collection: SetsListViewModel;
  wishlist: SetsListViewModel;
};

export function UserProfileTabs({
  collection,
  wishlist,
}: UserProfileTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(PROFILE_TABS).withDefault("collection"),
  );

  return (
    <Tabs
      selectedKey={tab}
      onSelectionChange={(key) => {
        void setTab(String(key) as ProfileTab);
      }}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Profile lists">
          <Tabs.Tab id="collection">
            Collection ({collection.totalCount})
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="wishlist">
            Wishlist ({wishlist.totalCount})
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="collection" className="pt-4">
        <ProfileTabPanel
          viewModel={collection}
          emptyMessage="This collection is empty."
        />
      </Tabs.Panel>
      <Tabs.Panel id="wishlist" className="pt-4">
        <ProfileTabPanel
          viewModel={wishlist}
          emptyMessage="This wishlist is empty."
          defaultSort="wishlist-scale"
          defaultDir="desc"
        />
      </Tabs.Panel>
    </Tabs>
  );
}

function ProfileTabPanel({
  viewModel,
  emptyMessage,
  defaultSort,
  defaultDir,
}: {
  viewModel: SetsListViewModel;
  emptyMessage: string;
  defaultSort?: SortOption;
  defaultDir?: SortDirection;
}) {
  if (viewModel.totalCount === 0) {
    return <p className="text-muted">{emptyMessage}</p>;
  }

  return (
    <SetsList
      viewModel={viewModel}
      readOnly
      defaultSort={defaultSort}
      defaultDir={defaultDir}
    />
  );
}

export const PROFILE_TABS = ["collection", "wishlist"] as const;

type ProfileTab = (typeof PROFILE_TABS)[number];
