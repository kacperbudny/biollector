import type { Metadata } from "next";
import { stackServerApp } from "@/auth/server";
import { SetsList } from "@/components/sets/sets-list";
import { setsService } from "@/services/sets.service";

export const metadata: Metadata = {
  title: "Sets",
  description: "Browse all Bionicle sets organized by year and wave",
};

export default async function SetsPage() {
  const user = await stackServerApp.getUser();
  const data = await setsService.getSetsListViewModel(user?.id);

  return <SetsList data={data} />;
}
