import { bionicleSets } from "@/data/sets";
import type { BionicleSet } from "@/domain/sets";

export class SetsRepository {
  constructor(private readonly dataSource: BionicleSet[]) {}

  getAll(): BionicleSet[] {
    return [...this.dataSource];
  }

  findOne(setNumber: string): BionicleSet | undefined {
    return this.dataSource.find((set) => set.catalogNumber === setNumber);
  }
}

export const setsRepository = new SetsRepository(bionicleSets);
