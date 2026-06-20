"use client";

import { Button } from "@heroui/react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-foreground/60">
        An unexpected error occurred. You can try again or come back later.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-foreground/40">
          Error ID: {error.digest}
        </p>
      )}
      <Button onPress={reset}>Try again</Button>
    </div>
  );
}
