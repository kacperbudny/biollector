"use client";

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
  useFilter,
} from "@heroui/react";
import { useQueryStates } from "nuqs";
import type React from "react";
import { filterParamDescriptors } from "@/components/sets/set-filter-params";
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

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:gap-4 self-start sticky top-24">
        <SearchField
          fullWidth
          aria-label="Search sets"
          value={searchValue}
          onChange={(v) => onSearchChange(v || null)}
          className="w-full"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name, catalog number, year or wave…" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <SetFilterFields filterParams={filterParams} onChange={handleChange} />

        <Button
          variant="ghost"
          isDisabled={!hasActiveFilters && !searchValue}
          onPress={handleClear}
          fullWidth
          className="mt-2"
        >
          Clear all
        </Button>
      </aside>

      {/* Mobile — search bar + Filters button in one row */}
      <div className="md:hidden mb-4 flex items-end gap-2">
        <SearchField
          aria-label="Search sets"
          value={searchValue}
          onChange={(v) => onSearchChange(v || null)}
          className="flex-1"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name, catalog number, year or wave…" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Drawer>
          <Button variant="outline" size="sm" className="shrink-0">
            {activeFilterCount > 0
              ? `Filters (${activeFilterCount})`
              : "Filters"}
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
                    onChange={handleChange}
                  />
                </Drawer.Body>
                <Drawer.Footer>
                  <Button
                    variant="ghost"
                    isDisabled={!hasActiveFilters && !searchValue}
                    onPress={handleClear}
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
    </>
  );
}

type SetFilterFieldsProps = {
  filterParams: {
    years: ReleaseYear[];
    types: SetType[];
    waves: Wave[];
    characters: BionicleCharacter[];
  };
  onChange: (patch: {
    years?: ReleaseYear[];
    types?: SetType[];
    waves?: Wave[];
    characters?: BionicleCharacter[];
  }) => void;
};

function SetFilterFields({ filterParams, onChange }: SetFilterFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <FilterAutocomplete
        label="Year"
        placeholder="Any year"
        options={YEAR_OPTIONS}
        selectedKeys={filterParams.years}
        onChange={(years) => onChange({ years: years as ReleaseYear[] })}
      />
      <FilterAutocomplete
        label="Type"
        placeholder="Any type"
        options={TYPE_OPTIONS}
        selectedKeys={filterParams.types}
        onChange={(types) => onChange({ types: types as SetType[] })}
      />
      <FilterAutocomplete
        label="Wave"
        placeholder="Any wave"
        options={WAVE_OPTIONS}
        selectedKeys={filterParams.waves}
        onChange={(waves) => onChange({ waves: waves as Wave[] })}
      />
      <FilterAutocomplete
        label="Character"
        placeholder="Any character"
        options={CHARACTER_OPTIONS}
        selectedKeys={filterParams.characters}
        onChange={(characters) =>
          onChange({ characters: characters as BionicleCharacter[] })
        }
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
};

function FilterAutocomplete({
  label,
  placeholder,
  options,
  selectedKeys,
  onChange,
}: FilterAutocompleteProps) {
  const { contains } = useFilter({ sensitivity: "base" });

  const onRemoveTags = (keys: Set<Key>) => {
    onChange(selectedKeys.filter((k) => !keys.has(k)));
  };

  return (
    <Autocomplete
      placeholder={placeholder}
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => onChange((keys as string[]) ?? [])}
    >
      <Label>{label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({
            defaultChildren,
            isPlaceholder,
            state,
          }: {
            defaultChildren: React.ReactNode;
            isPlaceholder: boolean;
            state: { selectedItems: Array<{ key: Key }> };
          }) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map(
              (item) => item.key,
            );

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((key: Key) => {
                    const option = options.find((o) => o.id === key);
                    if (!option) {
                      return null;
                    }
                    return (
                      <Tag key={option.id} id={option.id}>
                        {option.label}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField
            autoFocus
            name={`filter-search-${label}`}
            variant="secondary"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder={`Search ${label.toLowerCase()}...`}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            renderEmptyState={() => <EmptyState>No results found</EmptyState>}
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
    </Autocomplete>
  );
}

const YEAR_OPTIONS = RELEASE_YEARS.map((y) => ({ id: y, label: y }));
const TYPE_OPTIONS = Object.values(SetType).map((t) => ({ id: t, label: t }));
const WAVE_OPTIONS = Object.values(Wave).map((w) => ({ id: w, label: w }));
const CHARACTER_OPTIONS = Object.values(BionicleCharacter).map((c) => ({
  id: c,
  label: c,
}));
