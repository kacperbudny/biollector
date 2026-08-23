"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  CloseButton,
  Collection,
  ComboBox,
  Description,
  EmptyState,
  Input,
  ListBox,
  Spinner,
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useState } from "react";
import type { SetSearchResultViewModel } from "@/domain/view-models/set-search-result.view-model";
import { useSetsSearch } from "@/hooks/use-sets-search";
import { cn } from "@/styles/cn";

type NavbarSearchProps = {
  variant: "desktop" | "mobile";
};

export function NavbarSearch({ variant }: NavbarSearchProps) {
  if (variant === "desktop") {
    return (
      <div className="hidden min-w-0 md:block">
        <SetsSearchComboBox className="w-72" />
      </div>
    );
  }

  return <NavbarMobileSearch />;
}

function NavbarMobileSearch() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        aria-label="Search sets"
        className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center"
        onPress={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </Button>
      {open ? (
        <div className="absolute inset-0 z-50 flex items-center gap-2 bg-background px-6">
          <SetsSearchComboBox
            autoFocus
            className="min-w-0 flex-1"
            onNavigate={() => setOpen(false)}
          />
          <CloseButton
            aria-label="Close search"
            onPress={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

type SetsSearchComboBoxProps = {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
};

function SetsSearchComboBox({
  className,
  autoFocus,
  onNavigate,
}: SetsSearchComboBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const { results, totalCount, isError, isFetching } = useSetsSearch(query);
  const showViewAll = totalCount > results.length;

  function navigateAndClear(href: string) {
    router.push(href);
    setQuery("");
    onNavigate?.();
    requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  function goToViewAll() {
    if (trimmedQuery.length === 0) {
      return;
    }
    navigateAndClear(setsSearchHref(trimmedQuery));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || trimmedQuery.length === 0) {
      return;
    }

    const focusedOption = event.currentTarget
      .closest("[data-slot='combo-box']")
      ?.querySelector("[role='option'][data-focused='true']");
    if (focusedOption) {
      return;
    }

    event.preventDefault();
    goToViewAll();
  }

  return (
    <div className={cn("relative", className)}>
      <ComboBox
        allowsCustomValue
        allowsEmptyCollection
        aria-label="Search all sets"
        autoFocus={autoFocus}
        defaultFilter={() => true}
        fullWidth
        inputValue={query}
        menuTrigger="input"
        onInputChange={setQuery}
      >
        <ComboBox.InputGroup>
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Search all sets…"
            className={cn("ps-8", trimmedQuery.length > 0 && "pe-9")}
            onKeyDown={handleInputKeyDown}
          />
          {trimmedQuery.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute top-1/2 right-1 z-10 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-default"
              onClick={() => setQuery("")}
            >
              <XMarkIcon className="size-4" />
            </button>
          ) : null}
          <ComboBox.Trigger className="pointer-events-none inset-0 h-full w-full opacity-0" />
        </ComboBox.InputGroup>
        <ComboBox.Popover
          className={cn(
            "w-(--trigger-width) max-w-(--trigger-width) overflow-hidden bg-overlay text-foreground",
            trimmedQuery.length === 0 && "hidden",
          )}
        >
          <ListBox
            renderEmptyState={() => (
              <SearchEmptyState
                isError={isError}
                isFetching={isFetching}
                hasQuery={trimmedQuery.length > 0}
              />
            )}
          >
            <Collection items={results}>
              {(set: SetSearchResultViewModel) => (
                <ListBox.Item
                  id={set.catalogNumber}
                  href={setsSearchHref(set.catalogNumber)}
                  textValue={`${set.name} ${set.catalogNumber}`}
                  className="min-w-0 overflow-hidden"
                  onPress={() => {
                    navigateAndClear(setsSearchHref(set.catalogNumber));
                  }}
                >
                  <SearchResultRow set={set} />
                </ListBox.Item>
              )}
            </Collection>
            {showViewAll ? (
              <ListBox.Item
                id="view-all"
                href={setsSearchHref(trimmedQuery)}
                textValue={`View all results (${totalCount})`}
                className="mt-1 border-t border-border"
                onPress={() => {
                  navigateAndClear(setsSearchHref(trimmedQuery));
                }}
              >
                <span className="text-accent">
                  View all results ({totalCount})
                </span>
              </ListBox.Item>
            ) : null}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </div>
  );
}

function SearchResultRow({ set }: { set: SetSearchResultViewModel }) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-foreground">
      <Image
        src={`/sets/${set.imageName}`}
        alt={set.name}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md bg-default object-cover"
      />
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {set.name}
        </span>
        <Description className="block truncate">
          {set.catalogNumber} · {set.releaseYear} · {set.wave}
        </Description>
      </div>
    </div>
  );
}

function SearchEmptyState({
  isError,
  isFetching,
  hasQuery,
}: {
  isError: boolean;
  isFetching: boolean;
  hasQuery: boolean;
}) {
  if (isFetching) {
    return (
      <EmptyState>
        <Spinner size="sm" />
        Searching…
      </EmptyState>
    );
  }

  if (isError) {
    return <EmptyState>Couldn't load results</EmptyState>;
  }

  if (hasQuery) {
    return <EmptyState>No results found</EmptyState>;
  }

  return null;
}

function setsSearchHref(query: string): string {
  return `/sets?q=${encodeURIComponent(query)}`;
}
