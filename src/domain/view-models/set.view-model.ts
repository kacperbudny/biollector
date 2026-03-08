import type { BionicleSet } from "@/domain/sets";

export type SetViewModel = BionicleSet & {
  isInCollection: boolean;
  userRating?: number;
  averageRating?: number;
};
