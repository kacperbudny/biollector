"use client";

import { LinkIcon } from "@heroicons/react/24/outline";
import { Button, toast } from "@heroui/react";

type CopyProfileLinkButtonProps = {
  userId: string;
  tab?: "wishlist";
};

export function CopyProfileLinkButton({
  userId,
  tab,
}: CopyProfileLinkButtonProps) {
  async function copyLink() {
    const url = getPublicProfileUrl(window.location.origin, userId, tab);

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.danger("Could not copy link");
    }
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      onPress={() => {
        void copyLink();
      }}
      aria-label="Copy profile link"
    >
      <LinkIcon className="h-4 w-4" />
      Copy link
    </Button>
  );
}

function getPublicProfileUrl(
  origin: string,
  userId: string,
  tab?: "wishlist",
): string {
  const path =
    tab === "wishlist" ? `/u/${userId}?tab=wishlist` : `/u/${userId}`;
  return `${origin}${path}`;
}
