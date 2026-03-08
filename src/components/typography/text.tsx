import type { PropsWithChildren } from "react";

export function MutedText({ children }: PropsWithChildren) {
  return <span className="ml-2 font-normal text-default-500">{children}</span>;
}
