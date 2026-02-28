import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { SetsList } from "@/components/sets/sets-list";
import { PageTitle } from "@/components/typography/headings";
import { userCollectionService } from "@/services/user-collection.service";

export const metadata: Metadata = {
  title: "My collection",
  description: "View and manage your Bionicle set collection",
};

export default async function CollectionPage() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/auth");
  }

  const data = await userCollectionService.getCollectionListViewModel(user.id);

  return (
    <>
      <PageTitle>My collection</PageTitle>
      {data.length > 0 ? <SetsList data={data} /> : <CollectionEmpty />}
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
