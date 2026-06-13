"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SetCard } from "@/components/sets/set-card";
import {
  SectionHeading,
  SubsectionHeading,
} from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type { SetsGroupedViewModel } from "@/domain/view-models/sets-grouped.view-model";

// TODO: get rid of this virtualization mess while implementing server-side filters.

type VirtualSectionHeader = {
  kind: "section-header";
  label: string;
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

type VirtualGroupHeader = {
  kind: "group-header";
  label: string;
  collectionCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

type VirtualCardRow = {
  kind: "card-row";
  sets: SetViewModel[];
  // Bottom padding to replicate original group/section spacing.
  // pb-4 = within a wave, pb-8 = last row of a wave, pb-12 = last row of a year.
  bottomPadding: "pb-4" | "pb-8" | "pb-12";
};

type VirtualRow = VirtualSectionHeader | VirtualGroupHeader | VirtualCardRow;

const GRID_BREAKPOINTS = [
  { minWidth: 1280, columns: 6 },
  { minWidth: 768, columns: 3 },
  { minWidth: 640, columns: 2 },
] as const;

function getCurrentColumns(): number {
  for (const bp of GRID_BREAKPOINTS) {
    if (window.matchMedia(`(min-width: ${bp.minWidth}px)`).matches) {
      return bp.columns;
    }
  }
  return 1;
}

function useGridColumns(): number {
  // Optimistic desktop default for SSR — corrected on the client in useEffect.
  const [columns, setColumns] = useState(6);

  useEffect(() => {
    setColumns(getCurrentColumns());
    const handler = () => setColumns(getCurrentColumns());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return columns;
}

// Flattens SetsGroupedViewModel into a list of virtual rows
function buildVirtualRows(
  vm: SetsGroupedViewModel,
  columns: number,
): VirtualRow[] {
  const rows: VirtualRow[] = [];

  for (const section of vm.sections) {
    if ("groups" in section) {
      rows.push({
        kind: "section-header",
        label: section.label,
        collectionCount: section.collectionCount,
        totalCount: section.totalCount,
        isComplete: section.isComplete,
      });

      for (const [gi, group] of section.groups.entries()) {
        const isLastGroup = gi === section.groups.length - 1;

        rows.push({
          kind: "group-header",
          label: group.label,
          collectionCount: group.collectionCount,
          totalCount: group.totalCount,
          isComplete: group.isComplete,
        });

        for (let i = 0; i < group.sets.length; i += columns) {
          const isLastChunk = i + columns >= group.sets.length;
          rows.push({
            kind: "card-row",
            sets: group.sets.slice(i, i + columns),
            bottomPadding: !isLastChunk
              ? "pb-4"
              : isLastGroup
                ? "pb-12"
                : "pb-8",
          });
        }
      }
    } else {
      rows.push({ kind: "section-header", label: section.label });

      for (let i = 0; i < section.sets.length; i += columns) {
        const isLastChunk = i + columns >= section.sets.length;
        rows.push({
          kind: "card-row",
          sets: section.sets.slice(i, i + columns),
          bottomPadding: isLastChunk ? "pb-12" : "pb-4",
        });
      }
    }
  }

  return rows;
}

// Initial height estimates; measureElement refines them after mount.
function estimateRowSize(row: VirtualRow): number {
  if (row.kind === "section-header") {
    return 56;
  }
  if (row.kind === "group-header") {
    return 44;
  }
  return 320;
}

type SetsGroupedVirtualListProps = {
  viewModel: SetsGroupedViewModel;
};

export function SetsGroupedVirtualList({
  viewModel,
}: SetsGroupedVirtualListProps) {
  const columns = useGridColumns();
  const rows = useMemo(
    () => buildVirtualRows(viewModel, columns),
    [viewModel, columns],
  );

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Recalculate the distance from the top of the page to the list container
  // on mount and on every resize so useWindowVirtualizer always has an
  // accurate offset even when the navbar/header height changes responsively.
  useLayoutEffect(() => {
    const update = () =>
      setScrollMargin(listRef.current?.offsetTop ?? 0);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (i) => estimateRowSize(rows[i]),
    overscan: 3,
    scrollMargin,
  });

  return (
    <div
      ref={listRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={item.key}
          data-index={item.index}
          ref={virtualizer.measureElement}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
          }}
        >
          <VirtualRowRenderer row={rows[item.index]} columns={columns} />
        </div>
      ))}
    </div>
  );
}

function VirtualRowRenderer({
  row,
  columns,
}: {
  row: VirtualRow;
  columns: number;
}) {
  if (row.kind === "section-header") {
    return (
      <SectionHeading>
        <span className="inline-flex items-center gap-2">
          {row.label}
          {row.isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden
            />
          )}
        </span>
        {row.collectionCount != null && (
          <MutedText>
            {" "}
            ({row.collectionCount} of {row.totalCount} sets)
          </MutedText>
        )}
      </SectionHeading>
    );
  }

  if (row.kind === "group-header") {
    return (
      <SubsectionHeading>
        <span className="inline-flex items-center gap-2">
          {row.label}
          {row.isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden
            />
          )}
        </span>
        {row.collectionCount != null && (
          <MutedText>
            {" "}
            ({row.collectionCount} of {row.totalCount} sets)
          </MutedText>
        )}
      </SubsectionHeading>
    );
  }

  return (
    <div
      className={row.bottomPadding}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "1rem",
      }}
    >
      {row.sets.map((set) => (
        <SetCard key={set.catalogNumber} set={set} wave={set.wave} />
      ))}
    </div>
  );
}
