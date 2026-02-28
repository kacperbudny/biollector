import type { PropsWithChildren } from "react";

export function PageTitle({ children }: PropsWithChildren) {
  return <h1 className="mb-6 text-4xl font-bold">{children}</h1>;
}

export function SectionHeading({ children }: PropsWithChildren) {
  return <h2 className="mb-4 text-2xl font-semibold">{children}</h2>;
}

export function SubsectionHeading({ children }: PropsWithChildren) {
  return <h3 className="mb-2 text-xl font-semibold">{children}</h3>;
}
