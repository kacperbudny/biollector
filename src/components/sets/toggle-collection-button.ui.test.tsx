import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toggleCollection } from "@/actions/user-collection.actions";
import { ToggleCollectionButton } from "./toggle-collection-button";

const { toggleCollectionAction, useUserMock } = vi.hoisted(() => ({
  toggleCollectionAction: vi
    .fn()
    .mockResolvedValue({ data: { success: true } }),
  useUserMock: vi.fn(),
}));

vi.mock("@/actions/user-collection.actions", () => ({
  toggleCollection: toggleCollectionAction,
}));

vi.mock("@stackframe/stack", () => ({
  useUser: () => useUserMock(),
}));

describe(ToggleCollectionButton.name, () => {
  const setNumber = "8534";

  beforeEach(() => {
    toggleCollectionAction.mockClear();
    useUserMock.mockReset();
  });

  it("is disabled when signed out", () => {
    useUserMock.mockReturnValue(null);

    render(
      <ToggleCollectionButton setNumber={setNumber} isInCollection={false} />,
    );

    const button = screen.getByRole("button", {
      name: "Sign in to add to collection",
    });
    expect(button).toBeDisabled();
  });

  it("calls toggleCollection when signed in and pressed while not in collection", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(
      <ToggleCollectionButton setNumber={setNumber} isInCollection={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to collection" }));

    await waitFor(() => {
      expect(toggleCollection).toHaveBeenCalledWith({ setNumber });
    });
  });

  it("calls toggleCollection when signed in and pressed while in collection", async () => {
    useUserMock.mockReturnValue({ id: "user-1" });

    render(
      <ToggleCollectionButton setNumber={setNumber} isInCollection={true} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Remove from collection" }),
    );

    await waitFor(() => {
      expect(toggleCollection).toHaveBeenCalledWith({ setNumber });
    });
  });
});
