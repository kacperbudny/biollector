import { z } from "zod";
import { type BionicleSet, Wave } from "@/domain/sets";

export type SetSearchResultViewModel = {
  catalogNumber: string;
  name: string;
  imageName: string;
  releaseYear: string;
  wave: Wave;
};

export namespace SetSearchResultViewModel {
  export function fromSet(set: BionicleSet): SetSearchResultViewModel {
    return {
      catalogNumber: set.catalogNumber,
      name: set.name,
      imageName: set.imageName,
      releaseYear: set.releaseYear,
      wave: set.wave,
    };
  }
}

export type SetSearchResultsViewModel = {
  sets: SetSearchResultViewModel[];
  totalCount: number;
};

export const setSearchResultsSchema = z.object({
  sets: z.array(
    z.object({
      catalogNumber: z.string(),
      name: z.string(),
      imageName: z.string(),
      releaseYear: z.string(),
      wave: z.enum(Wave),
    }),
  ),
  totalCount: z.number().int().nonnegative(),
});
