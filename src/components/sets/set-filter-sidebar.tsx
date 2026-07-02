"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import type { Key } from "@heroui/react";
import {
  Autocomplete,
  Button,
  Drawer,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  Tooltip,
  useFilter,
} from "@heroui/react";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { DialogContext } from "react-aria-components";
import { filterParamDescriptors } from "@/components/sets/set-filter-params";
import { SectionHeading } from "@/components/typography/headings";
import type { ReleaseYear } from "@/domain/set-filter";
import { RELEASE_YEARS } from "@/domain/set-filter";
import { BionicleCharacter, SetType, Wave } from "@/domain/sets";

type SetFilterSidebarProps = {
  searchValue: string;
  onSearchChange: (value: string | null) => void;
};

export function SetFilterSidebar({
  searchValue,
  onSearchChange,
}: SetFilterSidebarProps) {
  const [filterParams, setFilterParams] = useQueryStates(
    filterParamDescriptors,
  );

  const hasActiveFilters =
    filterParams.years.length > 0 ||
    filterParams.types.length > 0 ||
    filterParams.waves.length > 0 ||
    filterParams.characters.length > 0;

  const activeFilterCount = [
    filterParams.years,
    filterParams.types,
    filterParams.waves,
    filterParams.characters,
  ].filter((a) => a.length > 0).length;

  const handleChange = (patch: Partial<typeof filterParams>) => {
    const next = { ...filterParams, ...patch };
    setFilterParams({
      years: next.years.length > 0 ? next.years : null,
      types: next.types.length > 0 ? next.types : null,
      waves: next.waves.length > 0 ? next.waves : null,
      characters: next.characters.length > 0 ? next.characters : null,
    });
  };

  const handleClear = () => {
    setFilterParams({
      years: null,
      types: null,
      waves: null,
      characters: null,
    });
    onSearchChange(null);
  };

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

type SetFilterParams = {
  years: ReleaseYear[];
  types: SetType[];
  waves: Wave[];
  characters: BionicleCharacter[];
};

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
    <div className="md:hidden mb-4 flex items-end gap-2">
      <SetFilterSearchField
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        className="flex-1"
      />
      <Drawer>
        <Button variant="outline" size="sm" className="shrink-0">
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
    </div>
  );
}

type FilterAutocompleteProps = {
  label: string;
  placeholder: string;
  options: { id: string; label: string }[];
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
                    {option.label}
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
  options: { id: string; label: string }[];
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
              {option.label}
            </Tag>
          );
        })}
      </TagGroup.List>
    </TagGroup>
  );
}

const YEAR_OPTIONS = RELEASE_YEARS.map((y) => ({ id: y, label: y }));
const TYPE_OPTIONS = Object.values(SetType).map((t) => ({ id: t, label: t }));
const WAVE_OPTIONS = Object.values(Wave).map((w) => ({ id: w, label: w }));
const CHARACTER_OPTIONS = Object.values(BionicleCharacter).map((c) => ({
  id: c,
  label: c,
}));
