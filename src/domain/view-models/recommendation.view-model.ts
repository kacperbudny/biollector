import type { SetViewModel } from "@/domain/view-models/set.view-model";

export class RecommendationViewModel {
  constructor(
    public readonly set: SetViewModel,
    public readonly score: number,
    public readonly reasons: string[],
  ) {}
}
