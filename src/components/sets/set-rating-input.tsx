"use client";

import { LockClosedIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Tooltip, toast } from "@heroui/react";
import { useUser } from "@stackframe/stack";
import { useOptimisticAction } from "next-safe-action/hooks";
import { setRating } from "@/actions/set-rating.actions";
import { getActionErrorMessage } from "@/actions/utils";
import { cn } from "@/styles/cn";

const MAX_RATING = 5;

type SetRatingInputProps = {
  setNumber: string;
  userRating?: number;
};

export function SetRatingInput({ setNumber, userRating }: SetRatingInputProps) {
  const user = useUser();
  const isSignedIn = !!user;

  const { execute, optimisticState, isExecuting } = useOptimisticAction(
    setRating,
    {
      currentState: userRating,
      updateFn: (_state, input) => input.rating,
      onError: ({ error }) =>
        toast.danger("Error", {
          description: getActionErrorMessage(error),
        }),
    },
  );

  return (
    <fieldset className="border-0 p-0" aria-label="Rating">
      <Tooltip delay={300} isDisabled={isSignedIn}>
        <Tooltip.Trigger>
          <div
            className={cn(
              "set-rating-stars relative flex items-center gap-0.5 overflow-hidden",
              isExecuting && "set-rating-shimmer",
            )}
          >
            {Array.from({ length: MAX_RATING }, (_, i) => {
              const value = i + 1;
              return (
                <RatingStar
                  key={value}
                  value={value}
                  filled={
                    optimisticState !== undefined && value <= optimisticState
                  }
                  disabled={!isSignedIn || isExecuting}
                  onClick={() => execute({ setNumber, rating: value })}
                />
              );
            })}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content placement="top" className="max-w-xs">
          <span className="inline-flex items-center gap-1.5">
            <LockClosedIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Sign in to rate
          </span>
        </Tooltip.Content>
      </Tooltip>
    </fieldset>
  );
}

type RatingStarProps = {
  value: number;
  filled: boolean;
  disabled: boolean;
  onClick: () => void;
};

function RatingStar({ value, filled, disabled, onClick }: RatingStarProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="touch-manipulation p-1 text-muted transition-colors disabled:cursor-default disabled:opacity-70 md:p-0.5"
      aria-label={`${value} star${value !== 1 ? "s" : ""}`}
      aria-pressed={filled}
    >
      {filled ? (
        <StarIconSolid className="h-5 w-5 text-warning md:h-4 md:w-4" />
      ) : (
        <StarIcon className="h-5 w-5 md:h-4 md:w-4" />
      )}
    </button>
  );
}
