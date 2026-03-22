import type { PropsWithChildren } from "react";
import { MutedText } from "@/components/typography/text";

export function PageTitle({
  children,
  subtitle,
}: PropsWithChildren<{ subtitle?: string }>) {
  return (
    <h1 className="mb-6 text-3xl font-bold md:text-4xl">
      {children}{" "}
      {subtitle && <MutedText className="ml-0 md:ml-2">{subtitle}</MutedText>}
    </h1>
  );
}

export function SectionHeading({ children }: PropsWithChildren) {
  return <h2 className="mb-4 text-2xl font-semibold">{children}</h2>;
}

export function SubsectionHeading({ children }: PropsWithChildren) {
  return <h3 className="mb-2 text-xl font-semibold">{children}</h3>;
}
