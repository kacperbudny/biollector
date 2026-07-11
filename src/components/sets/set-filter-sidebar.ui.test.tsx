import { render, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SetFilterSidebar } from "./set-filter-sidebar";

const { useUserMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

function renderSidebar() {
  const ui: ReactElement = (
    <SetFilterSidebar searchValue="" onSearchChange={() => {}} />
  );
  return render(ui, { wrapper: NuqsTestingAdapter });
}

describe(SetFilterSidebar.name, () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it("hides user-specific filters when signed out", () => {
    useUserMock.mockReturnValue(null);

    renderSidebar();

    expect(screen.queryByText("In collection")).not.toBeInTheDocument();
    expect(screen.queryByText("Not in collection")).not.toBeInTheDocument();
    expect(screen.queryByText("Wishlist")).not.toBeInTheDocument();
    expect(screen.queryByText("Your rating")).not.toBeInTheDocument();
    // Average rating is global and always visible.
    expect(screen.queryAllByText("Average rating").length).toBeGreaterThan(0);
  });

  it("shows all filters when signed in", () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    renderSidebar();

    expect(screen.getByText("In collection")).toBeInTheDocument();
    expect(screen.getByText("Not in collection")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Your rating")).toBeInTheDocument();
    expect(screen.queryAllByText("Average rating").length).toBeGreaterThan(0);
  });
});
