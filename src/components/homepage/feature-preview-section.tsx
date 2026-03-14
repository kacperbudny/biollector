import {
  ArchiveBoxIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardBody } from "@heroui/card";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/typography/headings";
import { EyebrowHeadline } from "@/components/typography/text";

export function FeaturePreviewSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <EyebrowHeadline>What You Can Do</EyebrowHeadline>
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
          icon={<ArchiveBoxIcon className="h-6 w-6" />}
        >
          Mark sets as owned, keep an eye on your progress, and understand how
          close you are to finishing each era.
        </FeaturePreviewCard>
        <FeaturePreviewCard
          title="Build a Wanted List"
          icon={<HeartIcon className="h-6 w-6" />}
        >
          Keep the sets you are hunting for front and center so your next pickup
          is always easy to choose.
        </FeaturePreviewCard>
        <FeaturePreviewCard
          title="Rate Your Favorites"
          icon={<StarIcon className="h-6 w-6" />}
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
    <Card className="h-full border border-default-200 bg-linear-to-b from-background to-default-50 shadow-sm">
      <CardBody className="space-y-4 p-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-default-600">{children}</p>
        </div>
      </CardBody>
    </Card>
  );
}
