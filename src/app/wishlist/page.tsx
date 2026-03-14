import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/auth/server";
import { SetsList } from "@/components/sets/sets-list";
import { PageTitle } from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import { userWishlistService } from "@/domain/services/user-wishlist.service";

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
      <PageTitle>
        Wishlist
        <MutedText>
          ({wishlistCount} set{wishlistCount !== 1 ? "s" : ""})
        </MutedText>
      </PageTitle>
      {wishlistCount > 0 ? (
        <SetsList viewModel={viewModel} />
      ) : (
        <WishlistEmpty />
      )}
    </>
  );
}

function WishlistEmpty() {
  return (
    <p className="text-default-500">
      Your wishlist is empty. Add sets from the{" "}
      <Link href="/sets" className="text-primary hover:underline">
        Sets
      </Link>{" "}
      page.
    </p>
  );
}
