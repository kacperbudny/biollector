"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import type { Key } from "@heroui/react";
import {
  Autocomplete,
  Button,
  Drawer,
  EmptyState,
  Label,
  ListBox,
  ScrollShadow,
  SearchField,
  Tag,
  TagGroup,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useFilter,
} from "@heroui/react";
import { useUser } from "@stackframe/stack";
import type { ReactNode } from "react";
import { DialogContext } from "react-aria-components";
import { SectionHeading } from "@/components/typography/headings";
import type {
  CollectionFilterValue,
  RatingFilterValue,
  ReleaseYear,
  WishlistFilterValue,
} from "@/domain/set-filter";
import {
  RATING_FILTER_VALUES,
  RELEASE_YEARS,
  WISHLIST_FILTER_VALUES,
} from "@/domain/set-filter";
import { BionicleCharacter, SetType, Wave } from "@/domain/sets";
import {
  getWishlistScaleLabel,
  type UserWishlistScale,
} from "@/domain/user-wishlist";
import {
  type SetFilterParams,
  useFilterSidebar,
} from "@/hooks/use-filter-sidebar";

type SetFilterSidebarProps = {
  searchValue: string;
  onSearchChange: (value: string | null) => void;
};

export function SetFilterSidebar({
  searchValue,
  onSearchChange,
}: SetFilterSidebarProps) {
  const {
    filterParams,
    handleChange,
    handleClear,
    hasActiveFilters,
    activeFilterCount,
  } = useFilterSidebar({ onSearchChange });

  const sharedProps = {
    searchValue,
    onSearchChange,
    filterParams,
    onFilterChange: handleChange,
    onClear: handleClear,
    hasActiveFilters,
  };

  return (
    <>
      <SetFilterSidebarDesktop {...sharedProps} />
      <SetFilterSidebarMobile
        {...sharedProps}
        activeFilterCount={activeFilterCount}
      />
    </>
  );
}

type SetFilterSidebarSharedProps = {
  searchValue: string;
  onSearchChange: (value: string | null) => void;
  filterParams: SetFilterParams;
  onFilterChange: (patch: Partial<SetFilterParams>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

function SetFilterSidebarDesktop({
  searchValue,
  onSearchChange,
  filterParams,
  onFilterChange,
  onClear,
  hasActiveFilters,
}: SetFilterSidebarSharedProps) {
  return (
    <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col self-start sticky top-24">
      <ScrollShadow
        hideScrollBar
        className="flex max-h-[calc(100vh-6rem)] flex-col pb-8 pr-1"
      >
        <SectionHeading>Filters</SectionHeading>

        <div className="flex flex-col gap-4">
          <SetFilterSearchField
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            className="w-full"
            fullWidth
          />

          <SetFilterFields
            filterParams={filterParams}
            onChange={onFilterChange}
          />

          <Button
            variant="ghost"
            isDisabled={!hasActiveFilters && !searchValue}
            onPress={onClear}
            fullWidth
            className="mt-2"
          >
            Clear all
          </Button>
        </div>
      </ScrollShadow>
    </aside>
  );
}

type SetFilterSidebarMobileProps = SetFilterSidebarSharedProps & {
  activeFilterCount: number;
};

function SetFilterSidebarMobile({
  searchValue,
  onSearchChange,
  filterParams,
  onFilterChange,
  onClear,
  hasActiveFilters,
  activeFilterCount,
}: SetFilterSidebarMobileProps) {
  return (
    <div className="mb-4 flex w-full min-w-0 items-end gap-2 md:hidden">
      <SetFilterSearchField
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        className="min-w-0 flex-1"
      />
      <Drawer>
        <Button variant="outline" size="sm" className="max-w-fit shrink-0">
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Filters</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <SetFilterFields
                  filterParams={filterParams}
                  onChange={onFilterChange}
                />
              </Drawer.Body>
              <Drawer.Footer>
                <Button
                  variant="ghost"
                  isDisabled={!hasActiveFilters && !searchValue}
                  onPress={onClear}
                  slot="close"
                  fullWidth
                >
                  Clear all
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}

type SetFilterSearchFieldProps = {
  searchValue: string;
  onSearchChange: (value: string | null) => void;
  className?: string;
  fullWidth?: boolean;
};

function SetFilterSearchField({
  searchValue,
  onSearchChange,
  className,
  fullWidth,
}: SetFilterSearchFieldProps) {
  return (
    <SearchField
      fullWidth={fullWidth}
      aria-label="Search sets"
      value={searchValue}
      onChange={(v) => onSearchChange(v || null)}
      className={className}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Search sets…" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

type SetFilterFieldsProps = {
  filterParams: SetFilterParams;
  onChange: (patch: Partial<SetFilterParams>) => void;
};

function SetFilterFields({ filterParams, onChange }: SetFilterFieldsProps) {
  const isSignedIn = !!useUser();

  return (
    <div className="flex flex-col gap-4">
      <FilterAutocomplete
        label="Release year"
        placeholder="Select year(s)"
        options={YEAR_OPTIONS}
        selectedKeys={filterParams.years}
        onChange={(years) => onChange({ years: years as ReleaseYear[] })}
      />
      <FilterAutocomplete
        label="Set type"
        placeholder="Select type(s)"
        options={TYPE_OPTIONS}
        selectedKeys={filterParams.types}
        onChange={(types) => onChange({ types: types as SetType[] })}
      />
      <FilterAutocomplete
        label="Wave"
        placeholder="Select wave(s)"
        options={WAVE_OPTIONS}
        selectedKeys={filterParams.waves}
        onChange={(waves) => onChange({ waves: waves as Wave[] })}
      />
      <FilterAutocomplete
        label="Character"
        placeholder="Select character(s)"
        options={CHARACTER_OPTIONS}
        selectedKeys={filterParams.characters}
        onChange={(characters) =>
          onChange({ characters: characters as BionicleCharacter[] })
        }
        labelHint="Only characters that appear in more than one set are listed"
      />
      <FilterAutocomplete
        label="Average rating"
        placeholder="Select rating(s)"
        options={AVERAGE_RATING_OPTIONS}
        selectedKeys={filterParams.averageRatings}
        onChange={(averageRatings) =>
          onChange({ averageRatings: averageRatings as RatingFilterValue[] })
        }
        labelHint="Averages are rounded down"
      />
      {isSignedIn ? (
        <>
          <FilterAutocomplete
            label="Wishlist"
            placeholder="Select priority"
            options={WISHLIST_OPTIONS}
            selectedKeys={filterParams.wishlist}
            onChange={(wishlist) =>
              onChange({ wishlist: wishlist as WishlistFilterValue[] })
            }
          />
          <FilterAutocomplete
            label="Your rating"
            placeholder="Select rating(s)"
            options={USER_RATING_OPTIONS}
            selectedKeys={filterParams.userRatings}
            onChange={(userRatings) =>
              onChange({ userRatings: userRatings as RatingFilterValue[] })
            }
          />
          <CollectionToggle
            value={filterParams.collection}
            onChange={(collection) => onChange({ collection })}
          />
        </>
      ) : null}
    </div>
  );
}

type CollectionToggleProps = {
  value: CollectionFilterValue | null;
  onChange: (value: CollectionFilterValue | null) => void;
};

function CollectionToggle({ value, onChange }: CollectionToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-foreground">Collection</span>
      <ToggleButtonGroup
        aria-label="Collection"
        selectionMode="single"
        fullWidth
        selectedKeys={value ? [value] : []}
        onSelectionChange={(keys) => {
          const [next] = [...keys] as CollectionFilterValue[];
          onChange(next ?? null);
        }}
      >
        <ToggleButton id="in">In collection</ToggleButton>
        <ToggleButton id="not-in">
          <ToggleButtonGroup.Separator />
          Not in collection
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

type FilterOption = { id: string; label: string; node?: ReactNode };

type FilterAutocompleteProps = {
  label: string;
  placeholder: string;
  options: FilterOption[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  labelHint?: string;
};

function FilterAutocomplete({
  label,
  placeholder,
  options,
  selectedKeys,
  onChange,
  labelHint,
}: FilterAutocompleteProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  const filterSearchLabel = `Search ${label.toLowerCase()}`;

  const onRemoveTags = (keys: Set<Key>) => {
    onChange(selectedKeys.filter((k) => !keys.has(k)));
  };

  return (
    <div className="flex flex-col gap-1">
      {labelHint ? (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <FilterLabelHint text={labelHint} />
        </div>
      ) : null}
      <Autocomplete
        placeholder={placeholder}
        selectionMode="multiple"
        value={selectedKeys}
        onChange={(keys) => onChange((keys as string[]) ?? [])}
      >
        {labelHint ? (
          <Label className="sr-only">{label}</Label>
        ) : (
          <Label>{label}</Label>
        )}
        <Autocomplete.Trigger>
          <Autocomplete.Value>
            {(props) => (
              <FilterAutocompleteValue
                {...props}
                label={label}
                options={options}
                onRemoveTags={onRemoveTags}
              />
            )}
          </Autocomplete.Value>
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        {/* Using DialogContext.Provider is a workaround to fix the aria-label issue - without it, console logs errors*/}
        <DialogContext.Provider value={{ "aria-label": label }}>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField
                autoFocus
                aria-label={filterSearchLabel}
                name={`filter-search-${label}`}
                variant="secondary"
              >
                <Label className="sr-only">{filterSearchLabel}</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    placeholder={`Search ${label.toLowerCase()}...`}
                  />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                aria-label={label}
                renderEmptyState={() => (
                  <EmptyState>No results found</EmptyState>
                )}
              >
                {options.map((option) => (
                  <ListBox.Item
                    key={option.id}
                    id={option.id}
                    textValue={option.label}
                  >
                    {option.node ?? option.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </DialogContext.Provider>
      </Autocomplete>
    </div>
  );
}

function FilterLabelHint({ text }: { text: string }) {
  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger
        aria-label="More information"
        className="inline-flex text-muted transition-colors hover:text-foreground"
      >
        <QuestionMarkCircleIcon className="h-4 w-4 shrink-0" />
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-xs">
        <p className="text-xs">{text}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}

type FilterAutocompleteValueProps = {
  defaultChildren: ReactNode;
  isPlaceholder: boolean;
  label: string;
  state: { selectedItems: Array<{ key: Key }> };
  options: FilterOption[];
  onRemoveTags: (keys: Set<Key>) => void;
};

function FilterAutocompleteValue({
  defaultChildren,
  isPlaceholder,
  label,
  state,
  options,
  onRemoveTags,
}: FilterAutocompleteValueProps) {
  if (isPlaceholder || state.selectedItems.length === 0) {
    return defaultChildren;
  }

  const selectedItemsKeys = state.selectedItems.map((item) => item.key);

  return (
    <TagGroup aria-label={label} size="sm" onRemove={onRemoveTags}>
      <TagGroup.List>
        {selectedItemsKeys.map((key) => {
          const option = options.find((o) => o.id === key);
          if (!option) {
            return null;
          }
          return (
            <Tag key={option.id} id={option.id} textValue={option.label}>
              {option.node ?? option.label}
            </Tag>
          );
        })}
      </TagGroup.List>
    </TagGroup>
  );
}

function RatingStars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => i + 1).map((star) => (
        <StarIcon key={star} className="h-4 w-4 text-warning" />
      ))}
    </span>
  );
}

const YEAR_OPTIONS = RELEASE_YEARS.map((y) => ({ id: y, label: y }));
const TYPE_OPTIONS = Object.values(SetType).map((t) => ({ id: t, label: t }));
const WAVE_OPTIONS = Object.values(Wave).map((w) => ({ id: w, label: w }));
const CHARACTER_OPTIONS = Object.values(BionicleCharacter).map((c) => ({
  id: c,
  label: c,
}));

const WISHLIST_OPTIONS: FilterOption[] = WISHLIST_FILTER_VALUES.map((value) =>
  value === "none"
    ? { id: value, label: "Not in wishlist" }
    : {
        id: value,
        label: getWishlistScaleLabel(Number(value) as UserWishlistScale),
      },
);

const USER_RATING_OPTIONS: FilterOption[] = RATING_FILTER_VALUES.map((value) =>
  value === "none"
    ? { id: value, label: "No rating" }
    : {
        id: value,
        label: `${value} star${value === "1" ? "" : "s"}`,
        node: <RatingStars count={Number(value)} />,
      },
);

const AVERAGE_RATING_OPTIONS: FilterOption[] = RATING_FILTER_VALUES.map(
  (value) =>
    value === "none"
      ? { id: value, label: "No ratings" }
      : {
          id: value,
          label: `${value} star${value === "1" ? "" : "s"}`,
          node: <RatingStars count={Number(value)} />,
        },
);
