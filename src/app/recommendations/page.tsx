import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@heroui/tooltip";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createLoader, parseAsBoolean } from "nuqs/server";
import { stackServerApp } from "@/auth/server";
import { SetCard } from "@/components/sets/set-card";
import { PageTitle } from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
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
      <PageTitle>
        Recommendations
        <MutedText>
          (Top {recommendations.length} set
          {recommendations.length !== 1 ? "s" : ""})
        </MutedText>
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
        <div key={recommendation.set.catalogNumber} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Tooltip
              placement="top"
              delay={200}
              content={
                <RecommendationTooltip reasons={recommendation.reasons} />
              }
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-default-500 transition-colors hover:text-primary"
                aria-label="Show recommendation reasons"
              >
                <InformationCircleIcon className="h-4 w-4" />
                Why this?
              </button>
            </Tooltip>
            {showScore ? (
              <span className="truncate text-xs text-default-500">
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

function RecommendationTooltip({ reasons }: { reasons: string[] }) {
  return (
    <div className="max-w-xs space-y-1 py-1">
      <p className="text-xs font-semibold">Recommended because:</p>
      <ul className="list-disc pl-4">
        {reasons.map((reason) => (
          <li key={reason} className="text-xs">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationsEmpty() {
  return (
    <p className="text-default-500">
      We have no recommendations yet. Add sets to your{" "}
      <Link href="/collection" className="text-primary hover:underline">
        collection
      </Link>{" "}
      or update your{" "}
      <Link href="/wishlist" className="text-primary hover:underline">
        wishlist
      </Link>{" "}
      to improve recommendations.
    </p>
  );
}
