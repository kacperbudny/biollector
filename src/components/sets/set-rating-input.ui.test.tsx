import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setRating } from "@/actions/set-rating.actions";
import { SetRatingInput } from "./set-rating-input";

const { setRatingAction, useUserMock } = vi.hoisted(() => ({
  setRatingAction: vi.fn().mockResolvedValue({ data: { success: true } }),
  useUserMock: vi.fn(),
}));

vi.mock("@/actions/set-rating.actions", () => ({
  setRating: setRatingAction,
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

describe(SetRatingInput.name, () => {
  const setNumber = "8534";

  beforeEach(() => {
    setRatingAction.mockClear();
    useUserMock.mockReset();
  });

  it("disables stars when signed out", () => {
    useUserMock.mockReturnValue(null);

    render(<SetRatingInput setNumber={setNumber} />);

    for (let v = 1; v <= 5; v += 1) {
      const name = v === 1 ? "1 star" : `${v} stars`;
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  });

  it("submits the chosen rating via the safe action when a star is clicked", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(<SetRatingInput setNumber={setNumber} />);

    fireEvent.click(screen.getByRole("button", { name: "3 stars" }));

    await waitFor(() => {
      expect(setRating).toHaveBeenCalledWith({
        setNumber,
        rating: 3,
      });
    });
  });

  it("displays the correct number of filled stars from the current rating", () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(<SetRatingInput setNumber={setNumber} userRating={4} />);

    for (let v = 1; v <= 4; v += 1) {
      const name = v === 1 ? "1 star" : `${v} stars`;
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    expect(screen.getByRole("button", { name: "5 stars" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
