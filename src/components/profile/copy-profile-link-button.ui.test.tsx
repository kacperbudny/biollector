import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopyProfileLinkButton } from "./copy-profile-link-button";

const { toastSuccess, toastDanger, writeText } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastDanger: vi.fn(),
  writeText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@heroui/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@heroui/react")>();
  return {
    ...actual,
    toast: {
      success: toastSuccess,
      danger: toastDanger,
    },
  };
});

describe(CopyProfileLinkButton.name, () => {
  beforeEach(() => {
    toastSuccess.mockClear();
    toastDanger.mockClear();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("copies the collection profile URL and toasts on success", async () => {
    render(<CopyProfileLinkButton userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy profile link" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/u/user-123`,
      );
    });
    expect(toastSuccess).toHaveBeenCalledWith("Link copied");
  });

  it("copies the wishlist profile URL when tab is wishlist", async () => {
    render(<CopyProfileLinkButton userId="user-123" tab="wishlist" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy profile link" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/u/user-123?tab=wishlist`,
      );
    });
  });

  it("toasts an error when clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));

    render(<CopyProfileLinkButton userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy profile link" }));

    await waitFor(() => {
      expect(toastDanger).toHaveBeenCalledWith("Could not copy link");
    });
  });
});
