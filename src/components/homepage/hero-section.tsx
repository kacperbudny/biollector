import { StarIcon } from "@heroicons/react/24/outline";
import { Button, Card, Chip, Label, ProgressBar } from "@heroui/react";
import Link from "next/link";
import { EyebrowHeadline } from "@/components/typography/text";

export function HeroSection({
  setCount,
  ratingsCount,
}: {
  setCount: number;
  ratingsCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-linear-to-br from-accent-soft via-background to-warning-soft px-6 py-14 shadow-sm sm:px-10 lg:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,214,102,0.28),transparent_28%)]" />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-warning-soft-hover blur-3xl" />

      <div className="relative grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-9">
          <div className="space-y-5">
            <EyebrowHeadline>Bionicle Collection Tracker</EyebrowHeadline>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Track your Bionicle collection
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                Browse every Bionicle set, track what you own, build a wanted
                list, and rank your favorite sets.
              </p>
            </div>
          </div>

          <CtaButtons />
          <StatChips setCount={setCount} ratingsCount={ratingsCount} />
        </div>

        <div className="grid gap-5">
          <PreviewDashboardCard />
          <CommunityFavoritesCard />
        </div>
      </div>
    </section>
  );
}

function CtaButtons() {
  return (
    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
      <Link href="/auth">
        <Button
          variant="primary"
          size="lg"
          className="min-w-44 h-12 rounded-full px-8 shadow-lg shadow-sky-500/25"
        >
          Create Account
        </Button>
      </Link>
      <Link href="/sets">
        <Button
          variant="secondary"
          size="lg"
          className="min-w-44 h-12 rounded-full border-slate-200 bg-transparent px-8 text-slate-900 border-2"
        >
          Browse Sets
        </Button>
      </Link>
    </div>
  );
}

function StatChips({
  setCount,
  ratingsCount,
}: {
  setCount: number;
  ratingsCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Chip
        variant="secondary"
        className="rounded-full border border-slate-200/95 bg-white/90 text-slate-700"
      >
        {setCount} sets
      </Chip>
      <Chip
        variant="secondary"
        className="rounded-full border border-slate-200/95 bg-white/90 text-slate-700"
      >
        2001-2023
      </Chip>
      <Chip
        variant="secondary"
        className="rounded-full border border-slate-200/95 bg-white/90 text-slate-700"
      >
        {ratingsCount} ratings
      </Chip>
    </div>
  );
}

function PreviewDashboardCard() {
  return (
    <Card className="gap-0 overflow-hidden border border-slate-200/90 bg-white p-0 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)]">
      <Card.Header className="flex items-center justify-between gap-4 p-6 pb-0 flex-row">
        <div>
          <EyebrowHeadline>Preview Dashboard</EyebrowHeadline>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Your collection
          </h2>
        </div>
        <Chip color="success" variant="soft" className="shrink-0 rounded-full">
          20% complete
        </Chip>
      </Card.Header>

      <Card.Content className="space-y-6 px-6 pb-2 pt-5">
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-3">
          <DashboardMetricCard label="Owned" value="12" />
          <DashboardMetricCard label="Wanted" value="8" />
          <DashboardMetricCard label="Rated" value="7" />
        </div>
      </Card.Content>

      <Card.Footer className="px-6 pb-6 pt-2">
        <ProgressBar value={20} minValue={0} maxValue={100} className="w-full">
          <div className="mb-2.5 flex w-full items-center justify-between gap-2">
            <Label className="text-sm font-medium text-slate-600">
              Collection progress
            </Label>
            <ProgressBar.Output className="text-sm font-semibold text-slate-700 tabular-nums" />
          </div>
          <ProgressBar.Track className="bg-slate-200/90">
            <ProgressBar.Fill className="bg-linear-to-r from-accent to-warning" />
          </ProgressBar.Track>
        </ProgressBar>
      </Card.Footer>
    </Card>
  );
}

function CommunityFavoritesCard() {
  return (
    <Card className="ml-auto w-full max-w-sm gap-0 overflow-hidden border border-slate-200/90 bg-white p-0 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.1)]">
      <Card.Header className="flex items-center justify-between gap-3 p-5 pb-0 flex-row">
        <h3 className="text-base font-semibold text-slate-950">
          Community favorites
        </h3>
        <Chip color="warning" variant="soft" className="shrink-0 rounded-full">
          <StarIcon className="h-3.5 w-3.5" />
          Live ratings
        </Chip>
      </Card.Header>
      <Card.Content className="space-y-2.5 p-5 pt-4">
        <div className="space-y-2 text-sm">
          <FavoritesListRow name="Axalara T9" value="4.8" />
          <FavoritesListRow name="Takanuva" value="4.7" />
          <FavoritesListRow name="Toa Metru Vakama" value="4.6" />
        </div>
      </Card.Content>
    </Card>
  );
}

function DashboardMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function FavoritesListRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3">
      <span className="font-medium text-slate-900">{name}</span>
      <span className="shrink-0 font-semibold tabular-nums text-amber-600">
        {value}
      </span>
    </div>
  );
}
