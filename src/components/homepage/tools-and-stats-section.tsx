import { Card } from "@heroui/react";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/typography/headings";
import { EyebrowHeadline } from "@/components/typography/text";

export function ToolsAndStatsSection({
  setCount,
  collectionCount,
  ratingsCount,
}: {
  setCount: number;
  collectionCount: number;
  ratingsCount: number;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <CollectionPreviewCard />
      <DatabaseStatsCard
        setCount={setCount}
        collectionCount={collectionCount}
        ratingsCount={ratingsCount}
      />
    </section>
  );
}

function CollectionPreviewCard() {
  return (
    <Card className="border border-slate-200/90 bg-white shadow-sm">
      <Card.Content className="space-y-8 p-4">
        <div className="space-y-3">
          <EyebrowHeadline>Collection Tools Preview</EyebrowHeadline>
          <SectionHeading>Your personal collection at a glance</SectionHeading>
          <p className="max-w-2xl text-muted">
            See the collection tools at your disposal: progress, priorities, and
            your favorite sets in one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <PreviewStat
            title="Owned"
            value="12"
            description="Sets already logged"
          />
          <PreviewStat
            title="Wanted"
            value="8"
            description="Next targets to find"
          />
          <PreviewStat
            title="Completion"
            value="20%"
            description="Progress across the archive"
          />
        </div>

        <div className="rounded-3xl border border-border bg-background p-5">
          <h3 className="font-semibold">What this helps you do</h3>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <PreviewListRow>
              See how much of a wave or year you already own.
            </PreviewListRow>
            <PreviewListRow>
              Keep wanted sets visible when planning your next buy.
            </PreviewListRow>
            <PreviewListRow>
              Spot your highest-rated sets at a glance.
            </PreviewListRow>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

function DatabaseStatsCard({
  setCount,
  collectionCount,
  ratingsCount,
}: {
  setCount: number;
  collectionCount: number;
  ratingsCount: number;
}) {
  return (
    <Card className="border border-border bg-foreground text-background shadow-sm">
      <Card.Content className="space-y-8 p-4">
        <div className="space-y-3">
          <EyebrowHeadline className="text-blue-400">
            Database Stats
          </EyebrowHeadline>
          <SectionHeading>
            Big enough to explore, simple enough to start
          </SectionHeading>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DatabaseStat
            label="Bionicle sets"
            value={setCount.toString()}
            description="Included in the archive"
          />
          <DatabaseStat
            label="Years covered"
            value={"2001-2023"}
            description="From the original run, through G2, and beyond"
          />
          <DatabaseStat
            label="Tracked collections"
            value={collectionCount.toString()}
            description="Collectors already logging sets"
          />
          <DatabaseStat
            label="Ratings"
            value={ratingsCount.toString()}
            description="Community scores submitted so far"
          />
        </div>
      </Card.Content>
    </Card>
  );
}

function PreviewStat({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-background p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

function PreviewListRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-gray-50 px-4 py-3">
      {children}
    </div>
  );
}

function DatabaseStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-background/70">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-background/70">{description}</p>
    </div>
  );
}
