import type { PropsWithChildren } from "react";
import { cn } from "@/styles/cn";

export function MutedText({ children }: PropsWithChildren) {
  return <span className="ml-2 font-normal text-default-500">{children}</span>;
}

export function EyebrowHeadline({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.2em] text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}
