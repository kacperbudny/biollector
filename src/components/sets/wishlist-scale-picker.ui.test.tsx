import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setWishlist } from "@/actions/user-wishlist.actions";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { WishlistScalePicker } from "./wishlist-scale-picker";

const { setWishlistAction, useUserMock, useIsMobileMock } = vi.hoisted(() => ({
  setWishlistAction: vi.fn().mockResolvedValue({ data: { success: true } }),
  useUserMock: vi.fn(),
  useIsMobileMock: vi.fn(() => false),
}));

vi.mock("@/actions/user-wishlist.actions", () => ({
  setWishlist: setWishlistAction,
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/hooks/use-is-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

describe(WishlistScalePicker.name, () => {
  const setNumber = "8534";

  beforeEach(() => {
    setWishlistAction.mockClear();
    useUserMock.mockReset();
    useIsMobileMock.mockReturnValue(false);
  });

  it("disables the trigger with a sign-in label when signed out", () => {
    useUserMock.mockReturnValue(null);

    render(
      <WishlistScalePicker setNumber={setNumber} currentWishlistValue={null} />,
    );

    const trigger = screen.getByRole("button", {
      name: "Sign in to add set to wishlist",
    });
    expect(trigger).toBeDisabled();
  });

  it("shows the add label when signed in with no wishlist state for the set", () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(
      <WishlistScalePicker setNumber={setNumber} currentWishlistValue={null} />,
    );

    expect(
      screen.getByRole("button", { name: "Add set to wishlist" }),
    ).toBeEnabled();
  });

  it("shows the current wishlist on the trigger when a wishlist is set", () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(
      <WishlistScalePicker
        setNumber={setNumber}
        currentWishlistValue={UserWishlistScale.MEDIUM}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: `Wishlist: ${SetViewModel.getWishlistScaleLabel(UserWishlistScale.MEDIUM)}`,
      }),
    ).toBeInTheDocument();
  });

  it("submits wishlist state on desktop", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });
    useIsMobileMock.mockReturnValue(false);

    render(
      <WishlistScalePicker setNumber={setNumber} currentWishlistValue={null} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: SetViewModel.getWishlistScaleLabel(UserWishlistScale.HIGH),
      }),
    );

    await waitFor(() => {
      expect(setWishlist).toHaveBeenCalledWith({
        setNumber,
        scale: UserWishlistScale.HIGH,
      });
    });
  });

  it("submits wishlist state from the mobile popover", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });
    useIsMobileMock.mockReturnValue(true);
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <WishlistScalePicker setNumber={setNumber} currentWishlistValue={null} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add set to wishlist" }),
    );

    const lowLabel = SetViewModel.getWishlistScaleLabel(UserWishlistScale.LOW);
    const lowButton = await screen.findByRole("button", { name: lowLabel });
    await user.click(lowButton);

    await waitFor(() => {
      expect(setWishlist).toHaveBeenCalledWith({
        setNumber,
        scale: UserWishlistScale.LOW,
      });
    });
  });

  it("clears the wishlist when selecting the same value again", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });
    useIsMobileMock.mockReturnValue(false);

    render(
      <WishlistScalePicker
        setNumber={setNumber}
        currentWishlistValue={UserWishlistScale.MUST_HAVE}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: SetViewModel.getWishlistScaleLabel(UserWishlistScale.MUST_HAVE),
      }),
    );

    await waitFor(() => {
      expect(setWishlist).toHaveBeenCalledWith({
        setNumber,
        scale: null,
      });
    });
  });
});
