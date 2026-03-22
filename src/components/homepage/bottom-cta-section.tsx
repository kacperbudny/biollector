import { Button } from "@heroui/react";
import Link from "next/link";
import { SectionHeading } from "@/components/typography/headings";
import { EyebrowHeadline } from "@/components/typography/text";

export function BottomCtaSection() {
  return (
    <section className="rounded-4xl border border-border bg-linear-to-r from-accent-soft via-background to-warning-soft px-6 py-14 text-center shadow-sm sm:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <EyebrowHeadline>Ready To Start?</EyebrowHeadline>
        <div className="space-y-4">
          <SectionHeading>
            Start building your Bionicle collection today
          </SectionHeading>
          <p className="text-muted">
            Browse the archive now, then create an account when you are ready to
            save your collection and ratings.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/auth">
            <Button variant="primary" className="rounded-full shadow-md">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
