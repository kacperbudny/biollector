import { createMiddleware, createSafeActionClient } from "next-safe-action";
import { stackServerApp } from "@/auth/server";
import { logger } from "@/lib/logger";

const loggingMiddleware = createMiddleware().define(async ({ next }) => {
  const start = Date.now();
  logger.info("Server action started");

  try {
    const result = await next();
    logger.info("Server action completed", { duration: Date.now() - start });
    return result;
  } catch (error) {
    logger.error("Server action failed", {
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
});

export const actionClient = createSafeActionClient().use(loggingMiddleware);

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { userId: user.id } });
});
