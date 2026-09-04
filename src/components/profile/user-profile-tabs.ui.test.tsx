import { render, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { Wave } from "@/domain/sets";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { setViewModelFixture } from "@/tests/fixtures";
import { UserProfileTabs } from "./user-profile-tabs";

vi.mock("@/components/sets/sets-list", () => ({
  SetsList: ({
    viewModel,
    defaultSort,
    displayCollectionCounts,
  }: {
    viewModel: SetsListViewModel;
    defaultSort?: string;
    displayCollectionCounts?: boolean;
  }) => (
    <div
      data-testid="sets-list"
      data-default-sort={defaultSort ?? ""}
      data-display-collection-counts={String(Boolean(displayCollectionCounts))}
    >
      {viewModel.sets.map((set) => set.name).join(", ")}
    </div>
  ),
}));

describe(UserProfileTabs.name, () => {
  const tahu = setViewModelFixture({
    catalogNumber: "8534",
    name: "Tahu",
    releaseYear: "2001",
    wave: Wave.TOA_MATA,
  });

  it("shows empty messages when both lists are empty", () => {
    render(
      <NuqsTestingAdapter>
        <UserProfileTabs
          collection={{ sets: [], totalCount: 0 }}
          wishlist={{ sets: [], totalCount: 0 }}
        />
      </NuqsTestingAdapter>,
    );

    expect(
      screen.getByRole("tab", { name: "Collection (0)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Wishlist (0)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("This collection is empty.")).toBeInTheDocument();
  });

  it("renders the collection list when it has sets", () => {
    render(
      <NuqsTestingAdapter>
        <UserProfileTabs
          collection={{ sets: [tahu], totalCount: 1 }}
          wishlist={{ sets: [], totalCount: 0 }}
        />
      </NuqsTestingAdapter>,
    );

    expect(
      screen.getByRole("tab", { name: "Collection (1)" }),
    ).toBeInTheDocument();
    const list = screen.getByTestId("sets-list");
    expect(list).toHaveTextContent("Tahu");
    expect(list).toHaveAttribute("data-display-collection-counts", "false");
  });

  it("groups the wishlist by wishlist scale", () => {
    render(
      <NuqsTestingAdapter searchParams="?tab=wishlist">
        <UserProfileTabs
          collection={{ sets: [], totalCount: 0 }}
          wishlist={{ sets: [tahu], totalCount: 1 }}
        />
      </NuqsTestingAdapter>,
    );

    expect(
      screen.getByRole("tab", { name: "Wishlist (1)" }),
    ).toBeInTheDocument();
    const list = screen.getByTestId("sets-list");
    expect(list).toHaveTextContent("Tahu");
    expect(list).toHaveAttribute("data-default-sort", "wishlist-scale");
  });
});
