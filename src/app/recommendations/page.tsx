import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Popover } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createLoader, parseAsBoolean } from "nuqs/server";
import { stackServerApp } from "@/auth/server";
import { SetCard } from "@/components/sets/set-card";
import { PageTitle } from "@/components/typography/headings";
import { recommendationsService } from "@/dependency-injection";
import type { RecommendationViewModel } from "@/domain/view-models/recommendation.view-model";

const recommendationsSearchParams = {
  debug: parseAsBoolean.withDefault(false),
};

const loadRecommendationsSearchParams = createLoader(
  recommendationsSearchParams,
);

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Discover the top Bionicle sets recommended for you",
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/auth");
  }

  const { debug: showScore } =
    await loadRecommendationsSearchParams(searchParams);
  const recommendations = await recommendationsService.getRecommendations(
    user.id,
  );

  return (
    <>
      <PageTitle subtitle={`(${recommendations.length} sets)`}>
        Recommendations
      </PageTitle>
      {recommendations.length > 0 ? (
        <RecommendationsGrid
          recommendations={recommendations}
          showScore={showScore}
        />
      ) : (
        <RecommendationsEmpty />
      )}
    </>
  );
}

function RecommendationsGrid({
  recommendations,
  showScore,
}: {
  recommendations: RecommendationViewModel[];
  showScore: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {recommendations.map((recommendation) => (
        <div key={recommendation.set.catalogNumber}>
          <div className="flex items-center justify-between gap-2 pb-1.5">
            <RecommendationReasonsPopover reasons={recommendation.reasons} />
            {showScore ? (
              <span className="truncate text-xs text-muted">
                Score: {recommendation.score.toFixed(1)}
              </span>
            ) : (
              <span />
            )}
          </div>
          <SetCard set={recommendation.set} wave={recommendation.set.wave} />
        </div>
      ))}
    </div>
  );
}

function RecommendationReasonsPopover({ reasons }: { reasons: string[] }) {
  return (
    <Popover>
      <Popover.Trigger
        aria-label="Show recommendation reasons"
        className="inline-flex items-center gap-1 rounded-md text-xs text-muted transition-colors hover:text-accent"
      >
        <InformationCircleIcon className="h-4 w-4 shrink-0" />
        Why this?
      </Popover.Trigger>
      <Popover.Content placement="top" offset={8} className="max-w-xs">
        <Popover.Arrow />
        <Popover.Dialog>
          <Popover.Heading className="text-xs font-semibold">
            Recommended because:
          </Popover.Heading>
          <ul className="list-disc pl-6">
            {reasons.map((reason) => (
              <li key={reason} className="text-xs">
                {reason}
              </li>
            ))}
          </ul>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function RecommendationsEmpty() {
  return (
    <p className="text-muted">
      We have no recommendations yet. Add sets to your{" "}
      <Link href="/collection" className="text-accent hover:underline">
        collection
      </Link>{" "}
      or update your{" "}
      <Link href="/wishlist" className="text-accent hover:underline">
        wishlist
      </Link>{" "}
      to improve recommendations.
    </p>
  );
}
