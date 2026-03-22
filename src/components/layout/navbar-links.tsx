import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/styles/cn";

export type NavMenuItem = {
  href: string;
  label: string;
  requiresAuth: boolean;
};

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/sets", label: "Sets", requiresAuth: false },
  { href: "/collection", label: "Collection", requiresAuth: true },
  { href: "/wishlist", label: "Wishlist", requiresAuth: true },
  { href: "/recommendations", label: "Recommendations", requiresAuth: true },
];

export function visibleNavItems(isSignedIn: boolean): NavMenuItem[] {
  return NAV_MENU_ITEMS.filter((item) => !item.requiresAuth || isSignedIn);
}

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
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        variant === "desktop" &&
          "rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent",
        variant === "mobile" &&
          "rounded-md px-3 py-3 text-base text-foreground transition-colors hover:bg-default hover:text-accent",
        className,
      )}
    >
      {children}
    </Link>
  );
}
