import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { WishlistSetsList } from "@/components/sets/wishlist-sets-list";
import { PageTitle } from "@/components/typography/headings";
import { userWishlistService } from "@/dependency-injection";

export const metadata: Metadata = {
  title: "My wishlist",
  description: "View your wishlisted Bionicle sets",
};

export default async function WishlistPage() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/auth");
  }

  const viewModel = await userWishlistService.getWishlistViewModel(user.id);
  const wishlistCount = viewModel.totalCount;

  return (
    <>
      <PageTitle
        subtitle={`(${wishlistCount} set${wishlistCount !== 1 ? "s" : ""})`}
      >
        Wishlist
      </PageTitle>
      {wishlistCount > 0 ? (
        <WishlistSetsList viewModel={viewModel} />
      ) : (
        <WishlistEmpty />
      )}
    </>
  );
}

function WishlistEmpty() {
  return (
    <p className="text-muted">
      Your wishlist is empty. Add sets from the{" "}
      <Link href="/sets" className="text-accent hover:underline">
        Sets
      </Link>{" "}
      page.
    </p>
  );
}
