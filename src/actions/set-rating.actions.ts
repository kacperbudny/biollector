"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/actions/action-client";
import { setRatingService } from "@/domain/services/set-rating.service";

const setRatingSchema = z.object({
  setNumber: z.string().min(1, "Set number is required").trim(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be 1–5")
    .max(5, "Rating must be 1–5"),
});

export const setRating = authActionClient
  .inputSchema(setRatingSchema)
  .action(async ({ parsedInput: { setNumber, rating }, ctx: { userId } }) => {
    await setRatingService.setRating(userId, setNumber, rating);

    revalidatePath("/sets");
    revalidatePath("/collection");

    return { success: true };
  });
