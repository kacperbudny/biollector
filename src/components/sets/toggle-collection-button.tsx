"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@heroui/button";
import { useUser } from "@stackframe/stack";
import { useTransition } from "react";
import {
  addToCollection,
  removeFromCollection,
} from "@/actions/user-collection.actions";

type ToggleCollectionButtonProps = {
  setNumber: string;
  isInCollection: boolean;
};

export function ToggleCollectionButton({
  setNumber,
  isInCollection,
}: ToggleCollectionButtonProps) {
  const user = useUser();
  const [isPending, startTransition] = useTransition();
  const isSignedIn = !!user;

  function handleClick() {
    if (!isSignedIn) {
      return;
    }
    startTransition(async () => {
      const result = isInCollection
        ? await removeFromCollection({ setNumber })
        : await addToCollection({ setNumber });
      if (result?.serverError ?? result?.validationErrors) {
        // Could show toast; for now rely on revalidation
      }
    });
  }

  const label = isSignedIn
    ? isInCollection
      ? "Remove from collection"
      : "Add to collection"
    : "Sign in to add to collection";

  return (
    <Button
      isIconOnly
      size="sm"
      variant="flat"
      className="absolute right-2 top-2 z-10 min-w-8 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      aria-label={label}
      title={label}
      isDisabled={!isSignedIn || isPending}
      onPress={handleClick}
    >
      {isInCollection ? (
        <BookmarkIconSolid className="h-5 w-5" />
      ) : (
        <PlusIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
