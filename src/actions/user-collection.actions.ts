"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { stackServerApp } from "@/auth/server";
import { userCollectionService } from "@/services/user-collection.service";

const setNumberSchema = z.string().min(1, "Set number is required").trim();

type ActionResult = { success: true } | { success: false; error: string };

// TODO: provide better DX for actions

export async function addToCollection(
  setNumber: string,
): Promise<ActionResult> {
  const user = await stackServerApp.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = setNumberSchema.safeParse(setNumber);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid set number",
    };
  }
  try {
    await userCollectionService.addSet(user.id, parsed.data);
    revalidatePath("/sets");
    revalidatePath("/collection");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add to collection" };
  }
}

export async function removeFromCollection(
  setNumber: string,
): Promise<ActionResult> {
  const user = await stackServerApp.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = setNumberSchema.safeParse(setNumber);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid set number",
    };
  }
  try {
    await userCollectionService.removeSet(user.id, parsed.data);
    revalidatePath("/sets");
    revalidatePath("/collection");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove from collection" };
  }
}
