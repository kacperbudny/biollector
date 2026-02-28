import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { SetCard } from "@/components/sets/set-card";
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

  const sets = await userCollectionService.getSetsForUser(user.id);

  return (
    <div className="py-8">
      <h1 className="mb-6 text-4xl font-bold">My collection</h1>
      {sets.length === 0 ? (
        <p className="text-default-500">
          Your collection is empty. Add sets from the{" "}
          <Link href="/sets" className="text-primary hover:underline">
            Sets
          </Link>{" "}
          page.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {sets.map((set) => (
            <SetCard key={set.catalogNumber} set={set} wave={set.wave} />
          ))}
        </div>
      )}
    </div>
  );
}
