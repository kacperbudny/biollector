import type { BionicleSet } from "@/domain/sets";

export class SetsRepository {
  constructor(private readonly dataSource: BionicleSet[]) {}

  getAll(): BionicleSet[] {
    return [...this.dataSource];
  }

  findOne(setNumber: string): BionicleSet | undefined {
    return this.dataSource.find((set) => set.catalogNumber === setNumber);
  }

  getRandomSets(count: number): BionicleSet[] {
    const copy = [...this.dataSource];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  getByCatalogNumbers(numbers: string[]): BionicleSet[] {
    const byNumber = new Map(
      this.dataSource.map((set) => [set.catalogNumber, set]),
    );
    return numbers
      .map((num) => byNumber.get(num))
      .filter((set): set is BionicleSet => set !== undefined);
  }
}
