"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/styles/cn";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  variant: "desktop" | "mobile";
  className?: string;
  onNavigate?: () => void;
};

export function NavLink({
  href,
  children,
  variant,
  className,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathMatchesNavHref(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        variant === "desktop" &&
          cn(
            "rounded-full px-4 py-2 text-sm transition-colors hover:bg-foreground/10",
            isCurrent ? "text-accent" : "text-foreground/50 hover:text-accent",
          ),
        variant === "mobile" &&
          cn(
            "rounded-md px-3 py-3 text-base transition-colors hover:bg-default",
            isCurrent ? "text-accent" : "text-foreground hover:text-accent",
          ),
        className,
      )}
    >
      {children}
    </Link>
  );
}

function pathMatchesNavHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
