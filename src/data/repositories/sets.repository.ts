import { type BionicleSet, bionicleSets } from "@/data/sets";

export type SetsRepository = {
  getAll: () => BionicleSet[];
};

export function createSetsRepository(
  dataSource: BionicleSet[],
): SetsRepository {
  return {
    getAll: () => [...dataSource],
  };
}

export const setsRepository = createSetsRepository(bionicleSets);
