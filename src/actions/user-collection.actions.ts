"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/actions/action-client";
import { userCollectionService } from "@/services/user-collection.service";

const setNumberSchema = z.object({
  setNumber: z.string().min(1, "Set number is required").trim(),
});

export const addToCollection = authActionClient
  .inputSchema(setNumberSchema)
  .action(async ({ parsedInput: { setNumber }, ctx: { userId } }) => {
    await userCollectionService.addSet(userId, setNumber);

    revalidatePath("/sets");
    revalidatePath("/collection");

    return { success: true };
  });

export const removeFromCollection = authActionClient
  .inputSchema(setNumberSchema)
  .action(async ({ parsedInput: { setNumber }, ctx: { userId } }) => {
    await userCollectionService.removeSet(userId, setNumber);

    revalidatePath("/sets");
    revalidatePath("/collection");

    return { success: true };
  });
