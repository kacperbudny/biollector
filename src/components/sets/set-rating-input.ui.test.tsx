import { setInteractionModality } from "@react-aria/interactions";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows the sign-in tooltip when hovering stars while signed out", async () => {
    useUserMock.mockReturnValue(null);
    // React Aria tooltips only open on hover when getInteractionModality() is
    // "pointer"; jsdom never runs the real pointer listeners that set it.
    setInteractionModality("pointer");

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const { container } = render(<SetRatingInput setNumber={setNumber} />);

    const tooltipTrigger = container.querySelector(
      '[data-slot="tooltip-trigger"]',
    );
    expect(tooltipTrigger).toBeInstanceOf(HTMLElement);

    await user.hover(tooltipTrigger as HTMLElement);

    await waitFor(
      () => {
        expect(screen.getByText("Sign in to rate")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    await user.unhover(tooltipTrigger as HTMLElement);
  });

  it("submits the chosen rating when a star is clicked", async () => {
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
