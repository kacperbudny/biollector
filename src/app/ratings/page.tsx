import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { RatingsSetsList } from "@/components/sets/ratings-sets-list";
import { PageTitle } from "@/components/typography/headings";
import { setRatingService } from "@/dependency-injection";

export const metadata: Metadata = {
  title: "My ratings",
  description: "View the sets you have rated",
};

export default async function RatingsPage() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/auth");
  }

  const viewModel = await setRatingService.getRatingsViewModel(user.id);
  const ratingsCount = viewModel.totalCount;

  return (
    <>
      <PageTitle
        subtitle={`(${ratingsCount} set${ratingsCount !== 1 ? "s" : ""})`}
      >
        My ratings
      </PageTitle>
      {ratingsCount > 0 ? (
        <RatingsSetsList viewModel={viewModel} />
      ) : (
        <RatingsEmpty />
      )}
    </>
  );
}

function RatingsEmpty() {
  return (
    <p className="text-muted">
      You have not rated any sets yet. Rate sets from the{" "}
      <Link href="/sets" className="text-accent hover:underline">
        Sets
      </Link>{" "}
      page.
    </p>
  );
}
