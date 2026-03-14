import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { SetCard } from "@/components/sets/set-card";
import { SectionHeading } from "@/components/typography/headings";
import { EyebrowHeadline } from "@/components/typography/text";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

export function ExampleContentSection({
  randomSets,
  topRatedSets,
}: {
  randomSets: SetViewModel[];
  topRatedSets: SetViewModel[];
}) {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <EyebrowHeadline>Example Content</EyebrowHeadline>
        <SectionHeading>See what is inside the archive</SectionHeading>
        <p className="text-default-600">
          Browse a quick sample of the database and see which sets are getting
          the strongest ratings.
        </p>
      </div>
      <SetsShowcase
        title="Five random sets"
        description="A quick sample from across the Bionicle lineup."
        sets={randomSets}
      />
      <SetsShowcase
        title="Highest rated sets"
        description="A snapshot of the sets currently leading the community rankings."
        sets={topRatedSets}
      />
    </section>
  );
}

function SetsShowcase({
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
          <h3 className="text-xl font-semibold">{title}</h3>
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
