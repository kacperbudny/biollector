"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/actions/action-client";
import { userWishlistService } from "@/domain/services/user-wishlist.service";

const setNumberSchema = z.object({
  setNumber: z.string().min(1, "Set number is required").trim(),
});

export const toggleWishlist = authActionClient
  .inputSchema(setNumberSchema)
  .action(async ({ parsedInput: { setNumber }, ctx: { userId } }) => {
    await userWishlistService.toggleSet(userId, setNumber);

    revalidatePath("/sets");
    revalidatePath("/collection");

    return { success: true };
  });
