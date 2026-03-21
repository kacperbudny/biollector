"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/actions/action-client";
import { userWishlistService } from "@/dependency-injection";
import { UserWishlistScale } from "@/domain/user-wishlist";

const setWishlistSchema = z.object({
  setNumber: z.string().min(1, "Set number is required").trim(),
  scale: z.enum(UserWishlistScale).nullable(),
});

export const setWishlist = authActionClient
  .inputSchema(setWishlistSchema)
  .action(async ({ parsedInput: { setNumber, scale }, ctx: { userId } }) => {
    await userWishlistService.setWishlist(userId, setNumber, scale);

    revalidatePath("/sets");
    revalidatePath("/collection");
    revalidatePath("/wishlist");

    return { success: true };
  });
