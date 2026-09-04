import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Wave } from "@/domain/sets";
import { setViewModelFixture } from "@/tests/fixtures";
import { SetCard } from "./set-card";

const { useUserMock, useIsMobileMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useIsMobileMock: vi.fn(() => false),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/hooks/use-is-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

vi.mock("@/actions/user-collection.actions", () => ({
  toggleCollection: vi.fn(),
}));

vi.mock("@/actions/user-wishlist.actions", () => ({
  setWishlist: vi.fn(),
}));

vi.mock("@/actions/set-rating.actions", () => ({
  setRating: vi.fn(),
}));

describe(SetCard.name, () => {
  const set = setViewModelFixture(
    {
      catalogNumber: "8534",
      name: "Tahu",
      releaseYear: "2001",
      wave: Wave.TOA_MATA,
    },
    { averageRating: 4.5 },
  );

  beforeEach(() => {
    useUserMock.mockReset();
    useIsMobileMock.mockReturnValue(false);
    useUserMock.mockReturnValue(null);
  });

  it("hides collection, wishlist, and rating controls when readOnly", () => {
    render(<SetCard set={set} wave={Wave.TOA_MATA} readOnly />);

    expect(screen.getByRole("heading", { name: "Tahu" })).toBeInTheDocument();
    expect(screen.getByText("8534")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Average rating 4.5" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Wishlist priority" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /collection/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Rating" }),
    ).not.toBeInTheDocument();
  });

  it("shows collection, wishlist, and rating controls by default", () => {
    render(<SetCard set={set} wave={Wave.TOA_MATA} />);

    expect(
      screen.getByRole("group", { name: "Wishlist priority" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in to add to collection" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Rating" })).toBeInTheDocument();
  });
});
