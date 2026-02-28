import { createSafeActionClient } from "next-safe-action";
import { stackServerApp } from "@/auth/server";

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { userId: user.id } });
});
