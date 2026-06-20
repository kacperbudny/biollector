import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const config = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    DATABASE_URL: z.url(),
    LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .optional()
      .default(process.env.NODE_ENV === "production" ? "info" : "debug"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },
});
