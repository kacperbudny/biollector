import {
  ArchiveBoxIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@heroui/react";
import type { ReactNode } from "react";
import { EyebrowHeadline } from "@/components/typography/text";

export function FeaturePreviewSection() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <EyebrowHeadline>What You Can Do</EyebrowHeadline>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Built for browsing, collecting, and ranking
        </h2>
        <p className="text-lg leading-relaxed text-slate-600">
          Keep your collection organized, surface your next targets, and see
          which sets stand out with the community.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        <FeaturePreviewCard
          title="Track Your Collection"
          icon={<ArchiveBoxIcon className="h-6 w-6" strokeWidth={1.75} />}
        >
          Mark sets as owned, keep an eye on your progress, and understand how
          close you are to finishing each era.
        </FeaturePreviewCard>
        <FeaturePreviewCard
          title="Build a Wanted List"
          icon={<HeartIcon className="h-6 w-6" strokeWidth={1.75} />}
        >
          Keep the sets you are hunting for front and center so your next pickup
          is always easy to choose.
        </FeaturePreviewCard>
        <FeaturePreviewCard
          title="Rate Your Favorites"
          icon={<StarIcon className="h-6 w-6" strokeWidth={1.75} />}
        >
          Give your top sets a score and quickly see which community favorites
          rise to the top.
        </FeaturePreviewCard>
      </div>
    </section>
  );
}

function FeaturePreviewCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Card className="h-full gap-0 overflow-hidden border border-slate-200/90 bg-white p-0 shadow-sm">
      <Card.Content className="flex flex-col gap-5 p-8 text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          {icon}
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-slate-950">{title}</h3>
          <p className="text-base leading-relaxed text-slate-600">{children}</p>
        </div>
      </Card.Content>
    </Card>
  );
}
