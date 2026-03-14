"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { EyeIcon as EyeIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useUser } from "@stackframe/stack";
import { useAction } from "next-safe-action/hooks";
import { toggleWishlist } from "@/actions/user-wishlist.actions";
import { getActionErrorMessage } from "@/actions/utils";

type ToggleWishlistButtonProps = {
  setNumber: string;
  wishlisted: boolean;
};

export function ToggleWishlistButton({
  setNumber,
  wishlisted,
}: ToggleWishlistButtonProps) {
  const user = useUser();
  const { execute, isPending } = useAction(toggleWishlist, {
    onError: ({ error }) => {
      addToast({
        title: "Error",
        description: getActionErrorMessage(error),
        color: "danger",
      });
    },
  });
  const isSignedIn = !!user;
  const label = getLabel(wishlisted, isSignedIn);

  function handleClick() {
    if (!isSignedIn) {
      return;
    }
    execute({ setNumber });
  }

  return (
    <Button
      isIconOnly
      size="sm"
      variant="flat"
      className="absolute left-2 top-2 z-10 min-w-8 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      aria-label={label}
      title={label}
      isDisabled={!isSignedIn || isPending}
      onPress={handleClick}
    >
      {wishlisted ? (
        <EyeIconSolid className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
    </Button>
  );
}

function getLabel(wishlisted: boolean, isSignedIn: boolean) {
  if (!isSignedIn) {
    return "Sign in to add to wishlist";
  }

  return wishlisted ? "Remove from wishlist" : "Add to wishlist";
}
