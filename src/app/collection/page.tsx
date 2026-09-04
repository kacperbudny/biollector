import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { CopyProfileLinkButton } from "@/components/profile/copy-profile-link-button";
import { SetsList } from "@/components/sets/sets-list";
import { PageTitle } from "@/components/typography/headings";
import { userCollectionService } from "@/dependency-injection";

export const metadata: Metadata = {
  title: "My collection",
  description: "View and manage your Bionicle set collection",
};

export default async function CollectionPage() {
  // TODO: authenticated layout?
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/auth");
  }

  const viewModel = await userCollectionService.getCollectionListViewModel(
    user.id,
  );
  const collectionCount = viewModel.totalCount;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageTitle
          className="mb-0"
          subtitle={`(${collectionCount} set${collectionCount !== 1 ? "s" : ""})`}
        >
          My collection
        </PageTitle>
        <CopyProfileLinkButton userId={user.id} />
      </div>
      {collectionCount > 0 ? (
        <SetsList viewModel={viewModel} displayCollectionCounts />
      ) : (
        <CollectionEmpty />
      )}
    </>
  );
}

function CollectionEmpty() {
  return (
    <p className="text-muted">
      Your collection is empty. Add sets from the{" "}
      <Link href="/sets" className="text-accent hover:underline">
        Sets
      </Link>{" "}
      page.
    </p>
  );
}
