import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Wave } from "@/domain/sets";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";
import type { SetsListViewModel } from "@/domain/view-models/sets-list.view-model";
import { setViewModelFixture } from "@/tests/fixtures";
import { SetsList } from "./sets-list";

// Mock the virtual list to avoid JSDOM virtualization issues
vi.mock("@/components/sets/sets-grouped-virtual-list", () => ({
  SetsGroupedVirtualList: ({
    viewModel,
  }: {
    viewModel: SetsGroupedViewModel;
  }) => (
    <div data-testid="virtual-list">
      {viewModel.sections.flatMap((section) =>
        "groups" in section
          ? section.groups.flatMap((g) =>
              g.sets.map((s) => (
                <div key={s.catalogNumber} data-testid="set-item">
                  {s.name}
                </div>
              )),
            )
          : section.sets.map((s) => (
              <div key={s.catalogNumber} data-testid="set-item">
                {s.name}
              </div>
            )),
      )}
    </div>
  ),
}));

const { useUserMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

describe(SetsList.name, () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  const set1 = setViewModelFixture(
    {
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    },
    { inCollection: true },
  );
  const set2 = setViewModelFixture(
    {
      catalogNumber: "8533",
      name: "Gali",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    },
    { inCollection: false },
  );
  const set3 = setViewModelFixture(
    {
      catalogNumber: "8550",
      name: "Gahlok",
      releaseYear: "2002",
      wave: Wave.BOHROK,
    },
    { inCollection: false },
  );

  const viewModel: SetsListViewModel = {
    sets: [set1, set2, set3],
    totalCount: 3,
  };

  function renderSetsList(showFilterSidebar = true) {
    return render(
      <SetsList viewModel={viewModel} showFilterSidebar={showFilterSidebar} />,
      { wrapper: NuqsTestingAdapter },
    );
  }

  it("renders all sets initially", () => {
    useUserMock.mockReturnValue(null);
    renderSetsList();

    expect(screen.getAllByTestId("set-item")).toHaveLength(3);
    const setNames = screen
      .getAllByTestId("set-item")
      .map((el) => el.textContent);
    expect(setNames).toEqual(["Gali", "Tahu", "Gahlok"]);
  });

  it("filters sets by text search", async () => {
    useUserMock.mockReturnValue(null);
    const user = userEvent.setup();
    renderSetsList();

    // The search field in the sidebar
    const searchInput = screen.getAllByPlaceholderText("Search sets…")[0];
    await user.type(searchInput, "Tahu");

    await waitFor(() => {
      expect(screen.getAllByTestId("set-item")).toHaveLength(1);
    });
    const setNames = screen
      .getAllByTestId("set-item")
      .map((el) => el.textContent);
    expect(setNames).toEqual(["Tahu"]);
  });

  it("filters sets by collection status when signed in", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });
    const user = userEvent.setup();
    renderSetsList();

    // Click the "In collection" toggle button (first one is desktop)
    const inCollectionBtn = screen.getAllByRole("radio", {
      name: /in collection/i,
    })[0];
    await user.click(inCollectionBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId("set-item")).toHaveLength(1);
    });
    const setNames = screen
      .getAllByTestId("set-item")
      .map((el) => el.textContent);
    expect(setNames).toEqual(["Tahu"]);
  });

  it("clears filters when clear button is clicked", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });
    const user = userEvent.setup();
    renderSetsList();

    const searchInput = screen.getAllByPlaceholderText("Search sets…")[0];
    await user.type(searchInput, "Tahu");

    await waitFor(() => {
      expect(screen.getAllByTestId("set-item")).toHaveLength(1);
    });

    const clearBtn = screen.getAllByRole("button", { name: /clear all/i })[0];
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId("set-item")).toHaveLength(3);
    });
  });
});
