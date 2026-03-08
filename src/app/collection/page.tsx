import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { SetsList } from "@/components/sets/sets-list";
import { PageTitle } from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import { userCollectionService } from "@/domain/services/user-collection.service";

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
  const collectionCount = viewModel.collectionCount ?? 0;

  return (
    <>
      <PageTitle>
        My collection
        <MutedText>
          ({collectionCount} set{collectionCount !== 1 ? "s" : ""})
        </MutedText>
      </PageTitle>
      {collectionCount > 0 ? (
        <SetsList viewModel={viewModel} />
      ) : (
        <CollectionEmpty />
      )}
    </>
  );
}

function CollectionEmpty() {
  return (
    <p className="text-default-500">
      Your collection is empty. Add sets from the{" "}
      <Link href="/sets" className="text-primary hover:underline">
        Sets
      </Link>{" "}
      page.
    </p>
  );
}
