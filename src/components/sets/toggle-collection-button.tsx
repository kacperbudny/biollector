"use client";

import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { ArchiveBoxIcon as ArchiveBoxIconSolid } from "@heroicons/react/24/solid";
import { Button, toast } from "@heroui/react";
import { useUser } from "@stackframe/stack";
import { useAction } from "next-safe-action/hooks";
import { toggleCollection } from "@/actions/user-collection.actions";
import { getActionErrorMessage } from "@/actions/utils";

type ToggleCollectionButtonProps = {
  setNumber: string;
  isInCollection: boolean;
};

export function ToggleCollectionButton({
  setNumber,
  isInCollection,
}: ToggleCollectionButtonProps) {
  const user = useUser();
  const { execute, isPending } = useAction(toggleCollection, {
    onError: ({ error }) => {
      toast.danger("Error", {
        description: getActionErrorMessage(error),
      });
    },
  });
  const isSignedIn = !!user;
  const label = getLabel(isInCollection, isSignedIn);

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
      variant="tertiary"
      className="absolute right-2 top-2 z-10 min-h-10 min-w-10 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 md:min-h-8 md:min-w-8"
      aria-label={label}
      isDisabled={!isSignedIn || isPending}
      onPress={handleClick}
    >
      {isInCollection ? (
        <ArchiveBoxIconSolid className="h-6 w-6 md:h-5 md:w-5" />
      ) : (
        <ArchiveBoxIcon className="h-6 w-6 md:h-5 md:w-5" />
      )}
    </Button>
  );
}

function getLabel(isInCollection: boolean, isSignedIn: boolean) {
  if (!isSignedIn) {
    return "Sign in to add to collection";
  }

  return isInCollection ? "Remove from collection" : "Add to collection";
}
