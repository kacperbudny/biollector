import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { stackServerApp } from "@/auth/server";
import { HeroSection } from "@/components/homepage/hero-section";
import { SetCard } from "@/components/sets/set-card";
import { SectionHeading } from "@/components/typography/headings";
import { setRatingService } from "@/domain/services/set-rating.service";
import { setsService } from "@/domain/services/sets.service";
import { userCollectionService } from "@/domain/services/user-collection.service";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export const metadata: Metadata = {
  title: "Track Your Bionicle Collection",
  description:
    "Browse every Bionicle set, track what you own, discover top-rated favorites, and start building your collection.",
};

export default async function Home() {
  const user = await stackServerApp.getUser();
  // TODO: lazy load these in separate components
  const [randomSets, topRatedSets, setCount, collectionCount, ratingsCount] =
    await Promise.all([
      setsService.getRandomSets(5, user?.id), // TODO: fix this reloading upon every request
      setsService.getTopRatedSets(5, user?.id),
      Promise.resolve(setsService.getSetsCount()),
      userCollectionService.getCollectionsCount(),
      setRatingService.getTotalRatingsCount(),
    ]);

  return (
    <div className="space-y-24 pb-16">
      <HeroSection setCount={setCount} ratingsCount={ratingsCount} />
      <FeaturePreviewSection />
      <ExampleContentSection
        randomSets={randomSets}
        topRatedSets={topRatedSets}
      />
      <ToolsAndStatsSection
        setCount={setCount}
        collectionCount={collectionCount}
        ratingsCount={ratingsCount}
      />
      <BottomCtaSection />
    </div>
  );
}

function FeaturePreviewSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          What You Can Do
        </p>
        <SectionHeading>
          Built for browsing, collecting, and ranking
        </SectionHeading>
        <p className="text-default-600">
          Keep your collection organized, surface your next targets, and see
          which sets stand out with the community.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <FeaturePreviewCard
          title="Track Your Collection"
          description="Mark sets as owned, keep an eye on your progress, and understand how close you are to finishing each era."
          icon={<ArchiveBoxIcon className="h-6 w-6" />}
        />
        <FeaturePreviewCard
          title="Build a Wanted List"
          description="Keep the sets you are hunting for front and center so your next pickup is always easy to choose."
          icon={<HeartIcon className="h-6 w-6" />}
        />
        <FeaturePreviewCard
          title="Rate Your Favorites"
          description="Give your top sets a score and quickly see which community favorites rise to the top."
          icon={<StarIcon className="h-6 w-6" />}
        />
      </div>
    </section>
  );
}

function ExampleContentSection({
  randomSets,
  topRatedSets,
}: {
  randomSets: SetViewModel[];
  topRatedSets: SetViewModel[];
}) {
  return (
    <section className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Example Content
        </p>
        <SectionHeading>See what is inside the archive</SectionHeading>
        <p className="text-default-600">
          Browse a quick sample of the database and see which sets are getting
          the strongest ratings.
        </p>
      </div>
      <SetsShowcaseSection
        title="Five random sets"
        description="A quick sample from across the Bionicle lineup."
        sets={randomSets}
      />
      <SetsShowcaseSection
        title="Highest rated sets"
        description="A snapshot of the sets currently leading the community rankings."
        sets={topRatedSets}
      />
    </section>
  );
}

function ToolsAndStatsSection({
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

function FeaturePreviewCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="h-full border border-default-200 bg-linear-to-b from-background to-default-50 shadow-sm">
      <CardBody className="space-y-4 p-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-default-600">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function SetsShowcaseSection({
  title,
  description,
  sets,
}: {
  title: string;
  description: string;
  sets: SetViewModel[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-default-600">{description}</p>
        </div>
        <Link
          href="/sets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-600"
        >
          View all sets
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {sets.map((set) => (
          <SetCard key={set.catalogNumber} set={set} wave={set.wave} />
        ))}
      </div>
    </div>
  );
}

function CollectionPreviewCard() {
  return (
    <Card className="border border-default-200 bg-linear-to-br from-default-50 to-background shadow-sm">
      <CardBody className="space-y-8 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Collection Tools Preview
          </p>
          <SectionHeading>Your personal collection at a glance</SectionHeading>
          <p className="max-w-2xl text-default-600">
            Even before sign-up, the homepage can show what the collection tools
            feel like: progress, priorities, and your favorite sets in one
            place.
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

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-default-200 bg-background p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Collection progress</h3>
              <span className="text-sm font-medium text-default-500">
                12 / 60 era goal
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-default-200">
              <div className="h-full w-1/5 rounded-full bg-linear-to-r from-primary to-success" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-default-500">
              <span>Current pace</span>
              <span>+3 this month</span>
            </div>
          </div>

          <div className="rounded-3xl border border-default-200 bg-background p-5">
            <h3 className="font-semibold">What this helps you do</h3>
            <div className="mt-4 space-y-3 text-sm text-default-600">
              <PreviewListRow text="See how much of a wave or year you already own." />
              <PreviewListRow text="Keep wanted sets visible when planning your next buy." />
              <PreviewListRow text="Spot your highest-rated sets at a glance." />
            </div>
          </div>
        </div>
      </CardBody>
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
    <Card className="border border-default-200 bg-foreground text-background shadow-sm">
      <CardBody className="space-y-8 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
            Database Stats
          </p>
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
            description="From the original run to G2"
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
      </CardBody>
    </Card>
  );
}

function BottomCtaSection() {
  return (
    <section className="rounded-4xl border border-default-200 bg-linear-to-r from-primary-100 via-background to-warning-50 px-6 py-14 text-center shadow-sm sm:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Ready To Start?
        </p>
        <div className="space-y-4">
          <SectionHeading>
            Start building your Bionicle collection today
          </SectionHeading>
          <p className="text-default-600">
            Browse the archive now, then create an account when you are ready to
            save your collection and ratings.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/auth">
            <Button variant="shadow" radius="full" color="primary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
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
    <div className="rounded-3xl border border-default-200 bg-background p-5">
      <p className="text-sm text-default-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-default-600">{description}</p>
    </div>
  );
}

function PreviewListRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50 px-4 py-3">
      {text}
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
