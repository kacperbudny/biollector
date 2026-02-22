import type { Metadata } from "next";
import { SetsList } from "@/components/sets/sets-list";

export const metadata: Metadata = {
  title: "Sets",
  description: "Browse all Bionicle sets organized by year and wave",
};

export default function SetsPage() {
  return <SetsList />;
}
