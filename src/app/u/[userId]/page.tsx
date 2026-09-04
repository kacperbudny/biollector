import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createLoader, parseAsStringLiteral } from "nuqs/server";
import { cache } from "react";
import {
  PROFILE_TABS,
  UserProfileTabs,
} from "@/components/profile/user-profile-tabs";
import { PageTitle } from "@/components/typography/headings";
import { userProfileService } from "@/dependency-injection";

const loadProfileSearchParams = createLoader({
  tab: parseAsStringLiteral(PROFILE_TABS).withDefault("collection"),
});

const loadPublicProfile = cache((userId: string) =>
  userProfileService.getPublicProfileViewModel(userId),
);

type PublicProfilePageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PublicProfilePageProps): Promise<Metadata> {
  const [{ userId }, { tab }] = await Promise.all([
    params,
    loadProfileSearchParams(searchParams),
  ]);
  const profile = await loadPublicProfile(userId);
  if (!profile) {
    notFound();
  }

  const listLabel = tab === "wishlist" ? "wishlist" : "collection";

  return {
    title: `${profile.displayName}'s ${listLabel}`,
    description: `View ${profile.displayName}'s Bionicle collection and wishlist`,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { userId } = await params;
  const profile = await loadPublicProfile(userId);
  if (!profile) {
    notFound();
  }

  return (
    <>
      <PageTitle>{profile.displayName}</PageTitle>
      <UserProfileTabs
        collection={profile.collection}
        wishlist={profile.wishlist}
      />
    </>
  );
}
