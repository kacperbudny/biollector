import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const config = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    DATABASE_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
