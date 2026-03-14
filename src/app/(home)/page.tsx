import type { Metadata } from "next";
import { stackServerApp } from "@/auth/server";
import { BottomCtaSection } from "@/components/homepage/bottom-cta-section";
import { ExampleContentSection } from "@/components/homepage/example-content-section";
import { FeaturePreviewSection } from "@/components/homepage/feature-preview-section";
import { HeroSection } from "@/components/homepage/hero-section";
import { ToolsAndStatsSection } from "@/components/homepage/tools-and-stats-section";
import { setRatingService } from "@/domain/services/set-rating.service";
import { setsService } from "@/domain/services/sets.service";
import { userCollectionService } from "@/domain/services/user-collection.service";

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
