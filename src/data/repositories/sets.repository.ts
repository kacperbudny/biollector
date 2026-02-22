import { type BionicleSet, bionicleSets } from "@/data/sets";

export class SetsRepository {
  constructor(private readonly dataSource: BionicleSet[]) {}

  getAll(): BionicleSet[] {
    return [...this.dataSource];
  }
}

export const setsRepository = new SetsRepository(bionicleSets);
