import { StarIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
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
    <section className="relative overflow-hidden rounded-4xl border border-default-200 bg-linear-to-br from-primary-100 via-background to-warning-50 px-6 py-14 shadow-sm sm:px-10 lg:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,214,102,0.28),transparent_28%)]" />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-warning/20 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <EyebrowHeadline>Bionicle Collection Tracker</EyebrowHeadline>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Track your Bionicle collection
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-default-700">
                Browse every Bionicle set, track what you own, build a wanted
                list, and rank your favorite sets.
              </p>
            </div>
          </div>

          <CtaButtons />
          <StatChips setCount={setCount} ratingsCount={ratingsCount} />
        </div>

        <div className="grid gap-4">
          <PreviewDashboardCard />
          <CommunityFavoritesCard />
        </div>
      </div>
    </section>
  );
}

function CtaButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/auth">
        <Button variant="shadow" radius="full" color="primary" size="lg">
          Create Account
        </Button>
      </Link>
      <Link href="/sets">
        <Button variant="bordered" radius="full" size="lg">
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
    <div className="flex flex-wrap gap-3">
      <Chip variant="bordered" className="border-default-200 bg-background/80">
        {setCount} sets
      </Chip>
      <Chip variant="bordered" className="border-default-200 bg-background/80">
        2001-2023
      </Chip>
      <Chip variant="bordered" className="border-default-200 bg-background/80">
        {ratingsCount} ratings
      </Chip>
    </div>
  );
}

function PreviewDashboardCard() {
  return (
    <Card className="border border-default-200/80 bg-background/90 shadow-xl shadow-black/5 backdrop-blur">
      <CardHeader className="flex items-center justify-between p-6 pb-0">
        <div>
          <EyebrowHeadline>Preview Dashboard</EyebrowHeadline>
          <h2 className="mt-2 text-2xl font-bold">Your collection</h2>
        </div>
        <Chip color="success" variant="flat" size="sm">
          20% complete
        </Chip>
      </CardHeader>

      <CardBody className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardMetricCard label="Owned" value="12" />
          <DashboardMetricCard label="Wanted" value="8" />
          <DashboardMetricCard label="Rated" value="7" />
        </div>
      </CardBody>

      <CardFooter className="p-6 pt-0">
        <Progress
          value={20}
          showValueLabel
          label="Collection progress"
          classNames={{
            indicator: "bg-linear-to-r from-primary to-warning",
            label: "text-sm font-medium text-default-600",
            value: "text-sm font-medium text-default-600",
          }}
        />
      </CardFooter>
    </Card>
  );
}

function CommunityFavoritesCard() {
  return (
    <Card className="ml-auto w-full max-w-sm border border-default-200/80 bg-background/85 shadow-lg shadow-black/5 backdrop-blur">
      <CardHeader className="flex items-center justify-between p-5 pb-0">
        <h3 className="font-semibold">Community favorites</h3>
        <Chip
          color="warning"
          variant="flat"
          size="sm"
          startContent={<StarIcon className="h-3.5 w-3.5" />}
        >
          Live ratings
        </Chip>
      </CardHeader>
      <CardBody className="space-y-3 p-5 pt-4">
        {/* TODO: make these actual values */}
        <div className="space-y-2 text-sm text-default-600">
          <FavoritesListRow name="Axalara T9" value="4.8" />
          <FavoritesListRow name="Takanuva" value="4.7" />
          <FavoritesListRow name="Toa Metru Vakama" value="4.6" />
        </div>
      </CardBody>
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
    <div className="rounded-3xl border border-default-200 bg-default-50 p-4">
      <p className="text-sm text-default-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function FavoritesListRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-default-200 bg-default-50 px-3 py-2">
      <span className="font-medium text-foreground">{name}</span>
      <span className="font-semibold text-warning-600">{value}</span>
    </div>
  );
}
