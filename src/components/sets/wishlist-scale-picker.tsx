"use client";

import {
  EyeIcon,
  EyeSlashIcon as EyeSlashIconOutline,
} from "@heroicons/react/24/outline";
import {
  EyeIcon as EyeIconSolid,
  EyeSlashIcon as EyeSlashIconSolid,
} from "@heroicons/react/24/solid";
import { Popover, toast, useOverlayState } from "@heroui/react";
import { useUser } from "@stackframe/stack";
import { useOptimisticAction } from "next-safe-action/hooks";
import { setWishlist } from "@/actions/user-wishlist.actions";
import { getActionErrorMessage } from "@/actions/utils";
import { UserWishlistScale } from "@/domain/user-wishlist";
import { SetViewModel } from "@/domain/view-models/set.view-model";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/styles/cn";

type WishlistScalePickerProps = {
  setNumber: string;
  wishlistScale: UserWishlistScale | null;
};

function getWishlistValuesDescending(): UserWishlistScale[] {
  return Object.values(UserWishlistScale)
    .filter((v): v is UserWishlistScale => typeof v === "number")
    .toSorted((a, b) => b - a);
}

export function WishlistScalePicker({
  setNumber,
  wishlistScale,
}: WishlistScalePickerProps) {
  const user = useUser();
  const isSignedIn = !!user;
  const isMobile = useIsMobile();

  const {
    execute,
    optimisticState: displayValue,
    isExecuting,
  } = useOptimisticAction(setWishlist, {
    currentState: wishlistScale,
    updateFn: (_state, input) => input.scale,
    onError: ({ error }) => {
      toast.danger("Error", {
        description: getActionErrorMessage(error),
      });
    },
  });

  function selectWishlistValue(scale: UserWishlistScale | null) {
    execute({ setNumber, scale: displayValue === scale ? null : scale });
  }

  return (
    <div className="group absolute left-2 top-2 z-10 flex">
      {isMobile ? (
        <MobileScalePopover
          selectedValue={displayValue}
          isSignedIn={isSignedIn}
          isDisabled={!isSignedIn || isExecuting}
          onClick={selectWishlistValue}
        />
      ) : (
        <DesktopScalePicker
          displayValue={displayValue}
          isSignedIn={isSignedIn}
          isExecuting={isExecuting}
          selectWishlistValue={selectWishlistValue}
        />
      )}
    </div>
  );
}

type DesktopScalePickerProps = {
  displayValue: UserWishlistScale | null;
  isSignedIn: boolean;
  isExecuting: boolean;
  selectWishlistValue: (scale: UserWishlistScale) => void;
};

function DesktopScalePicker({
  displayValue,
  isSignedIn,
  isExecuting,
  selectWishlistValue,
}: DesktopScalePickerProps) {
  return (
    <>
      <DesktopCollapsedTrigger
        value={displayValue}
        isSignedIn={isSignedIn}
        isDisabled={!isSignedIn || isExecuting}
      />
      <ScalePanel
        selectedValue={displayValue}
        isDisabled={!isSignedIn || isExecuting}
        variant="desktop"
        className="absolute -left-1 -top-1 flex opacity-0 pointer-events-none shadow-lg transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto rounded-lg"
        onClick={selectWishlistValue}
      />
    </>
  );
}

type DesktopCollapsedTriggerProps = {
  value: UserWishlistScale | null;
  isSignedIn: boolean;
  isDisabled: boolean;
};

function DesktopCollapsedTrigger({
  value,
  isSignedIn,
  isDisabled,
}: DesktopCollapsedTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70",
        "group-hover:opacity-0",
        isDisabled && "pointer-events-none opacity-60",
      )}
      aria-label={getTriggerLabel(value, isSignedIn)}
      disabled={isDisabled}
    >
      <WishlistTriggerIcon size="desktop" value={value} />
    </button>
  );
}

type MobileScalePopoverProps = {
  selectedValue: UserWishlistScale | null;
  isSignedIn: boolean;
  isDisabled: boolean;
  onClick: (scale: UserWishlistScale) => void;
};

function MobileScalePopover({
  selectedValue,
  isSignedIn,
  isDisabled,
  onClick,
}: MobileScalePopoverProps) {
  const overlayState = useOverlayState();

  return (
    <Popover isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
      <Popover.Trigger
        className={cn(
          "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm",
          "cursor-pointer transition-colors hover:bg-black/70",
          isDisabled && "pointer-events-none opacity-60",
        )}
        aria-label={getTriggerLabel(selectedValue, isSignedIn)}
      >
        <WishlistTriggerIcon size="mobile" value={selectedValue} />
      </Popover.Trigger>
      <Popover.Content
        offset={-43}
        placement="bottom"
        shouldFlip={false}
        className="ml-4.5"
      >
        <Popover.Dialog className="gap-0 p-0">
          <Popover.Heading className="sr-only">
            Wishlist priority
          </Popover.Heading>
          <ScalePanel
            selectedValue={selectedValue}
            isDisabled={isDisabled}
            variant="mobile"
            onClick={(selectedScale) => {
              onClick(selectedScale);
              overlayState.close();
            }}
          />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

type ScalePanelProps = {
  selectedValue: UserWishlistScale | null;
  isDisabled: boolean;
  variant: "desktop" | "mobile";
  className?: string;
  onClick: (scale: UserWishlistScale) => void;
};

function ScalePanel({
  selectedValue,
  isDisabled,
  variant,
  className,
  onClick,
}: ScalePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg bg-black/80 p-1 backdrop-blur-sm",
        className,
      )}
    >
      {getWishlistValuesDescending().map((value) => (
        <ScaleOptionButton
          key={value}
          value={value}
          isSelected={selectedValue === value}
          isDisabled={isDisabled}
          variant={variant}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

type ScaleOptionButtonProps = {
  value: UserWishlistScale;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: (scale: UserWishlistScale) => void;
  variant?: "desktop" | "mobile";
};

function ScaleOptionButton({
  value,
  isSelected,
  isDisabled,
  onClick,
  variant = "desktop",
}: ScaleOptionButtonProps) {
  const isMobileVariant = variant === "mobile";

  return (
    <button
      type="button"
      className={cn(
        "group/option relative inline-flex cursor-pointer items-center rounded-md text-white transition-colors hover:bg-white/20",
        isMobileVariant
          ? "min-h-10 w-full justify-start gap-2 px-2"
          : "min-h-8 min-w-8 justify-center",
        isSelected && "bg-white/20",
      )}
      aria-label={SetViewModel.getWishlistScaleLabel(value)}
      disabled={isDisabled}
      onClick={() => onClick(value)}
    >
      <WishlistScaleOptionIcon
        value={value}
        isSelected={isSelected}
        size={isMobileVariant ? "mobile" : "desktop"}
      />
      {isMobileVariant ? (
        <span className={cn("text-sm", isSelected && "font-semibold")}>
          {SetViewModel.getWishlistScaleLabel(value)}
        </span>
      ) : (
        <span className="z-20 pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/option:opacity-100">
          {SetViewModel.getWishlistScaleLabel(value)}
        </span>
      )}
    </button>
  );
}

function WishlistTriggerIcon({
  value,
  size,
}: {
  value: UserWishlistScale | null;
  size: "desktop" | "mobile";
}) {
  const iconClass = size === "mobile" ? "h-6 w-6" : "h-5 w-5";

  if (value === null) {
    return <EyeIcon className={iconClass} />;
  }

  if (value === UserWishlistScale.NOT_INTERESTED) {
    return <EyeSlashIconSolid className={iconClass} />;
  }

  return (
    <span className="relative inline-flex">
      <EyeIconSolid className={iconClass} />
      <span
        className="absolute -right-1 -bottom-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-bold leading-none text-white"
        aria-hidden
      >
        {value}
      </span>
    </span>
  );
}

function WishlistScaleOptionIcon({
  value,
  isSelected,
  size = "desktop",
}: {
  value: UserWishlistScale;
  isSelected: boolean;
  size?: "desktop" | "mobile";
}) {
  const iconSizeClass = size === "mobile" ? "h-6 w-6" : "h-5 w-5";
  const inactiveIconColorClass =
    size === "mobile" ? "text-default-100" : "text-default-200";
  const inactiveBadgeSizeClass =
    size === "mobile"
      ? "h-4 min-w-4 text-[10px]"
      : "h-3.5 min-w-3.5 text-[9px]";

  if (value === UserWishlistScale.NOT_INTERESTED) {
    return isSelected ? (
      <EyeSlashIconSolid className={iconSizeClass} />
    ) : (
      <EyeSlashIconOutline className={cn(iconSizeClass, "text-default-300")} />
    );
  }

  if (!isSelected) {
    return (
      <span className="relative inline-flex">
        <EyeIcon className={cn(iconSizeClass, inactiveIconColorClass)} />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-default-500 px-0.5 font-bold leading-none text-white",
            inactiveBadgeSizeClass,
          )}
          aria-hidden
        >
          {value}
        </span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex">
      <EyeIconSolid className={iconSizeClass} />
      <span
        className={cn(
          "absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-accent px-0.5 font-bold leading-none text-white",
          inactiveBadgeSizeClass,
        )}
        aria-hidden
      >
        {value}
      </span>
    </span>
  );
}

function getTriggerLabel(
  scale: UserWishlistScale | null,
  isSignedIn: boolean,
): string {
  if (!isSignedIn) {
    return "Sign in to add set to wishlist";
  }

  if (scale === null) {
    return "Add set to wishlist";
  }

  return `Wishlist: ${SetViewModel.getWishlistScaleLabel(scale)}`;
}
