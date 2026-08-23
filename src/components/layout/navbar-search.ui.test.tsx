import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { Wave } from "@/domain/sets";
import type { SetSearchResultsViewModel } from "@/domain/view-models/set-search-result.view-model";

const { useSetsSearchMock, pushMock } = vi.hoisted(() => ({
  useSetsSearchMock: vi.fn(),
  pushMock: vi.fn(),
}));

// TODO: should we use MSW instead?
vi.mock("@/hooks/use-sets-search", () => ({
  useSetsSearch: (query: string) => useSetsSearchMock(query),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const tahuResult = {
  catalogNumber: "8534",
  name: "Tahu",
  imageName: "8534.png",
  releaseYear: "2001",
  wave: Wave.TOA_MATA,
};

function mockSearch(
  query: string,
  result: SetSearchResultsViewModel,
  status: { isError?: boolean; isFetching?: boolean } = {},
) {
  useSetsSearchMock.mockImplementation((currentQuery: string) => {
    const hasQuery = currentQuery.trim().length > 0;
    const matches = currentQuery.trim() === query;
    const data = matches ? result : undefined;

    return {
      data,
      results: hasQuery ? (data?.sets ?? []) : [],
      totalCount: hasQuery ? (data?.totalCount ?? 0) : 0,
      isError: status.isError ?? false,
      isFetching: status.isFetching ?? false,
    };
  });
}

describe(NavbarSearch.name, () => {
  beforeEach(() => {
    useSetsSearchMock.mockReset();
    pushMock.mockReset();
    useSetsSearchMock.mockReturnValue({
      data: undefined,
      results: [],
      totalCount: 0,
      isError: false,
      isFetching: false,
    });
  });

  it("lists matching sets after typing", async () => {
    const user = userEvent.setup();
    mockSearch("tahu", { sets: [tahuResult], totalCount: 1 });

    render(<NavbarSearch variant="desktop" />);

    await user.type(
      screen.getByRole("combobox", { name: "Search all sets" }),
      "tahu",
    );

    const tahuOption = await screen.findByRole("option", { name: /Tahu/ });
    expect(tahuOption).toHaveAttribute("href", "/sets?q=8534");
    expect(screen.getByText("8534 · 2001 · Toa Mata")).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /View all results/ }),
    ).not.toBeInTheDocument();

    await user.click(tahuOption);
    expect(pushMock).toHaveBeenCalledWith("/sets?q=8534");
    expect(
      screen.getByRole("combobox", { name: "Search all sets" }),
    ).toHaveValue("");
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Search all sets" }),
      ).not.toHaveFocus();
    });
  });

  it("shows a view-all option when more sets match than are listed", async () => {
    const user = userEvent.setup();
    mockSearch("toa", {
      sets: Array.from({ length: 10 }, (_, i) => ({
        ...tahuResult,
        catalogNumber: String(i + 1),
        name: `Toa ${i + 1}`,
      })),
      totalCount: 14,
    });

    render(<NavbarSearch variant="desktop" />);

    await user.type(
      screen.getByRole("combobox", { name: "Search all sets" }),
      "toa",
    );

    const viewAll = await screen.findByRole("option", {
      name: "View all results (14)",
    });
    expect(viewAll).toHaveAttribute("href", "/sets?q=toa");
    await user.click(viewAll);
    expect(pushMock).toHaveBeenCalledWith("/sets?q=toa");
  });

  it("clears the input with the clear button", async () => {
    const user = userEvent.setup();
    mockSearch("tahu", { sets: [tahuResult], totalCount: 1 });

    const { container } = render(<NavbarSearch variant="desktop" />);

    const input = screen.getByRole("combobox", { name: "Search all sets" });
    await user.type(input, "tahu");
    expect(input).toHaveValue("tahu");

    const clearButton = container.querySelector(
      'button[aria-label="Clear search"]',
    );
    if (!(clearButton instanceof HTMLButtonElement)) {
      throw new Error("expected a clear search button");
    }
    await user.click(clearButton);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("navigates to the sets page on Enter when no option is highlighted", async () => {
    const user = userEvent.setup();
    mockSearch("tahu", { sets: [tahuResult], totalCount: 1 });

    render(<NavbarSearch variant="desktop" />);

    const input = screen.getByRole("combobox", { name: "Search all sets" });
    await user.type(input, "tahu");
    await screen.findByRole("option", { name: /Tahu/ });
    await user.keyboard("{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/sets?q=tahu");
    expect(input).toHaveValue("");
    await waitFor(() => {
      expect(input).not.toHaveFocus();
    });
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    mockSearch("zzzz", { sets: [], totalCount: 0 });

    render(<NavbarSearch variant="desktop" />);

    await user.type(
      screen.getByRole("combobox", { name: "Search all sets" }),
      "zzzz",
    );

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });
});
