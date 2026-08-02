"use client";

import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/solid";
import { Button, type Key, ListBox, Select } from "@heroui/react";
import { useUser } from "@stackframe/stack";
import {
  SetSort,
  type SortDirection,
  type SortOption,
} from "@/domain/set-sort";

type SortOptionConfig = {
  id: SortOption;
  label: string;
};

const ALL_SORT_OPTIONS: SortOptionConfig[] = [
  { id: "year-wave", label: "Year & Wave" },
  { id: "year", label: "Year" },
  { id: "wave", label: "Wave" },
  { id: "catalog-number", label: "Catalog number" },
  { id: "name", label: "Name" },
  { id: "set-type", label: "Set type" },
  { id: "wishlist-scale", label: "Wishlist priority" },
  { id: "user-rating", label: "Your rating" },
  { id: "average-rating", label: "Average rating" },
  { id: "date-added", label: "Date added to collection" },
];

type SetSortBarProps = {
  sort: SortOption;
  dir: SortDirection;
  onSortChange: (sort: SortOption, dir: SortDirection) => void;
  onDirectionChange: (dir: SortDirection) => void;
};

export function SetSortBar({
  sort,
  dir,
  onSortChange,
  onDirectionChange,
}: SetSortBarProps) {
  const isSignedIn = !!useUser();

  const options = ALL_SORT_OPTIONS.filter((opt) =>
    SetSort.isOptionAllowed(opt.id, isSignedIn),
  );

  const activeSort = options.some((o) => o.id === sort) ? sort : "year-wave";

  const handleSelectionChange = (key: Key | null) => {
    if (!key) {
      return;
    }
    const newOption = key as SortOption;
    onSortChange(newOption, getDefaultDirection(newOption));
  };

  const isAscending = dir === "asc";
  const directionLabel = isAscending ? "Ascending" : "Descending";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground shrink-0">
        Sort by
      </span>
      <Select
        value={activeSort}
        onChange={handleSelectionChange}
        aria-label="Sort sets by"
        className="w-48 sm:w-56"
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox aria-label="Sort options">
            {options.map((option) => (
              <ListBox.Item
                key={option.id}
                id={option.id}
                textValue={option.label}
              >
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Button
        variant="outline"
        isIconOnly
        aria-label={`Sort direction: ${directionLabel}. Click to switch to ${isAscending ? "Descending" : "Ascending"}`}
        onPress={() => onDirectionChange(isAscending ? "desc" : "asc")}
        className="shrink-0"
      >
        {isAscending ? (
          <BarsArrowUpIcon className="h-4 w-4" aria-hidden />
        ) : (
          <BarsArrowDownIcon className="h-4 w-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}

function getDefaultDirection(option: SortOption): SortDirection {
  switch (option) {
    case "wishlist-scale":
    case "user-rating":
    case "average-rating":
    case "date-added":
      return "desc";
    default:
      return "asc";
  }
}
