"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { addToast } from "@heroui/toast";
import { useUser } from "@stackframe/stack";
import { useAction } from "next-safe-action/hooks";
import { setRating } from "@/actions/set-rating.actions";
import { getActionErrorMessage } from "@/actions/utils";

const MAX_RATING = 5;

type SetRatingInputProps = {
  setNumber: string;
  userRating?: number;
};

export function SetRatingInput({ setNumber, userRating }: SetRatingInputProps) {
  const user = useUser();
  const isSignedIn = !!user;
  const { execute, isPending } = useAction(setRating, {
    onError: ({ error }) => {
      addToast({
        title: "Error",
        description: getActionErrorMessage(error),
        color: "danger",
      });
    },
  });

  function handleStarClick(rating: number) {
    if (!isSignedIn || isPending) {
      return;
    }
    execute({ setNumber, rating });
  }

  return (
    <fieldset
      className="flex items-center gap-0.5 border-0 p-0"
      aria-label="Rating"
    >
      {Array.from({ length: MAX_RATING }, (_, i) => {
        const value = i + 1;
        const filled = userRating !== undefined && value <= userRating;
        return (
          <button
            key={value}
            type="button"
            disabled={!isSignedIn || isPending}
            onClick={() => handleStarClick(value)}
            className="touch-manipulation p-0.5 text-default-400 transition-colors hover:text-warning disabled:cursor-default disabled:opacity-70 disabled:hover:text-default-400"
            aria-label={`${value} star${value !== 1 ? "s" : ""}`}
            aria-pressed={filled}
          >
            {filled ? (
              <StarIconSolid className="h-4 w-4 text-warning" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
