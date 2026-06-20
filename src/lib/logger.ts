import { headers } from "next/headers";
import { cache } from "react";
import { config } from "@/config";

const getRequestId = cache(async (): Promise<string | undefined> => {
  try {
    const h = await headers();
    return h.get("x-request-id") ?? undefined;
  } catch {
    return undefined;
  }
});

type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): Level {
  return config.LOG_LEVEL;
}

type LoggerInstance = {
  debug: (message: string, data?: object) => void;
  info: (message: string, data?: object) => void;
  warn: (message: string, data?: object) => void;
  error: (message: string, data?: object) => void;
};

function makeLogger(
  resolveRequestId: () => Promise<string | undefined>,
): LoggerInstance {
  const emit = async (level: Level, message: string, data?: object) => {
    const isSilent = process.env.NODE_ENV === "test";

    if (LEVELS[level] < LEVELS[getMinLevel()] || isSilent) {
      return;
    }

    const requestId = await resolveRequestId();
    const entry = {
      data,
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId !== undefined ? { requestId } : {}),
    };

    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(entry));
    } else if (level === "debug") {
      console.debug(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  };

  return {
    debug: (message, data) => {
      void emit("debug", message, data);
    },
    info: (message, data) => {
      void emit("info", message, data);
    },
    warn: (message, data) => {
      void emit("warn", message, data);
    },
    error: (message, data) => {
      void emit("error", message, data);
    },
  };
}

/** Default logger — reads requestId from the current request's headers (RSC / Server Action context). */
export const logger = makeLogger(getRequestId);

/**
 * Returns a logger instance bound to a known requestId.
 * Use this in contexts where `headers()` from `next/headers` is unavailable,
 * such as middleware (which reads headers directly from NextRequest).
 */
export function withRequestId(requestId: string): LoggerInstance {
  return makeLogger(() => Promise.resolve(requestId));
}
