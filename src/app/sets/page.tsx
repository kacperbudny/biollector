import type { Metadata } from "next";
import { stackServerApp } from "@/auth/server";
import { SetsList } from "@/components/sets/sets-list";
import { PageTitle } from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import { setsService } from "@/dependency-injection";

export const metadata: Metadata = {
  title: "Sets",
  description: "Browse all Bionicle sets organized by year and wave",
};

export default async function SetsPage() {
  const user = await stackServerApp.getUser();
  const data = await setsService.getSetsListViewModel(user?.id);

  return (
    <>
      <PageTitle>
        Sets
        <MutedText>({data.totalCount})</MutedText>
      </PageTitle>
      <SetsList viewModel={data} />
    </>
  );
}
