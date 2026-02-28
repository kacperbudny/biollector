"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/actions/action-client";
import { userCollectionService } from "@/domain/services/user-collection.service";

const setNumberSchema = z.object({
  setNumber: z.string().min(1, "Set number is required").trim(),
});

export const toggleCollection = authActionClient
  .inputSchema(setNumberSchema)
  .action(async ({ parsedInput: { setNumber }, ctx: { userId } }) => {
    await userCollectionService.toggleSet(userId, setNumber);

    revalidatePath("/sets");
    revalidatePath("/collection");

    return { success: true };
  });
