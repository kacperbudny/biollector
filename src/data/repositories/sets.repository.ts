import { bionicleSets } from "@/data/sets";
import type { BionicleSet } from "@/domain/sets";

export class SetsRepository {
  constructor(private readonly dataSource: BionicleSet[]) {}

  getAll(): BionicleSet[] {
    return [...this.dataSource];
  }
}

export const setsRepository = new SetsRepository(bionicleSets);
