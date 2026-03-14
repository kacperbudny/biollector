"use client";

import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon as EyeSlashIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useUser } from "@stackframe/stack";
import { useAction } from "next-safe-action/hooks";
import { setWishlist } from "@/actions/user-wishlist.actions";
import { getActionErrorMessage } from "@/actions/utils";
import { UserWishlistScale } from "@/domain/user-wishlist";

type NotInterestedButtonProps = {
  setNumber: string;
  notInterested: boolean;
};

export function NotInterestedButton({
  setNumber,
  notInterested,
}: NotInterestedButtonProps) {
  const user = useUser();
  const { execute, isPending } = useAction(setWishlist, {
    onError: ({ error }) => {
      addToast({
        title: "Error",
        description: getActionErrorMessage(error),
        color: "danger",
      });
    },
  });
  const isSignedIn = !!user;
  const label = getLabel(notInterested, isSignedIn);

  function handleClick() {
    if (!isSignedIn) {
      return;
    }
    execute({
      setNumber,
      scale: notInterested ? null : UserWishlistScale.NOT_INTERESTED,
    });
  }

  return (
    <Button
      isIconOnly
      size="sm"
      variant="flat"
      className="absolute left-10 top-2 z-10 min-w-8 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      aria-label={label}
      title={label}
      isDisabled={!isSignedIn || isPending}
      onPress={handleClick}
    >
      {notInterested ? (
        <EyeSlashIconSolid className="h-5 w-5" />
      ) : (
        <EyeSlashIcon className="h-5 w-5" />
      )}
    </Button>
  );
}

function getLabel(notInterested: boolean, isSignedIn: boolean) {
  if (!isSignedIn) {
    return "Sign in to mark not interested";
  }

  return notInterested ? "Remove not interested" : "Mark as not interested";
}
