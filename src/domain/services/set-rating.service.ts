import {
  type SetRatingRepositoryPort,
  setRatingRepository,
} from "@/data/repositories/set-rating.repository";
import {
  type SetsRepository,
  setsRepository,
} from "@/data/repositories/sets.repository";
import { SetRatingEntity } from "@/domain/set-rating.entity";

export class SetRatingService {
  constructor(
    private readonly setsRepository: SetsRepository,
    private readonly setRatingRepository: SetRatingRepositoryPort,
  ) {}

  async setRating(
    userId: string,
    setNumber: string,
    rating: number,
  ): Promise<void> {
    const set = this.setsRepository.findOne(setNumber);

    if (!set) {
      throw new Error(`Set not found: ${setNumber}`);
    }

    await this.setRatingRepository.setRating(
      SetRatingEntity.create({ userId, setNumber, rating }),
    );
  }
}

export const setRatingService = new SetRatingService(
  setsRepository,
  setRatingRepository,
);
