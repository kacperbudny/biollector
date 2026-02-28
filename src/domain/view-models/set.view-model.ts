import type { BionicleSet, Wave } from "@/data/sets";

export type SetViewModel = BionicleSet & { isInCollection: boolean };

export type SetsListViewModel = {
  year: string;
  waves: { wave: Wave; sets: SetViewModel[] }[];
}[];
