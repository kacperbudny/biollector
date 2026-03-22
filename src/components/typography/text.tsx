import type { PropsWithChildren } from "react";
import { cn } from "@/styles/cn";

export function MutedText({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn("font-normal text-muted", className)}>{children}</span>
  );
}

export function EyebrowHeadline({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.2em] text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}
