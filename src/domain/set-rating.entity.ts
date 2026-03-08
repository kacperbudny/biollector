import { z } from "zod";

const setRatingSchema = z.object({
  userId: z.string(),
  setNumber: z.string(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

export type SetRatingInput = z.infer<typeof setRatingSchema>;

export class SetRatingEntity {
  private constructor(
    readonly userId: string,
    readonly setNumber: string,
    readonly rating: number,
  ) {}

  static create(input: SetRatingInput): SetRatingEntity {
    const parsed = setRatingSchema.parse(input);
    return new SetRatingEntity(parsed.userId, parsed.setNumber, parsed.rating);
  }
}
