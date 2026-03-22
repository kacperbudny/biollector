import { Separator } from "@heroui/react";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { stackServerApp } from "@/auth/server";
import { NavLink, visibleNavItems } from "@/components/layout/navbar-links";
import { NavbarMobileMenu } from "@/components/layout/navbar-mobile-menu";

export async function Navbar() {
  const user = await stackServerApp.getUser();
  const isSignedIn = !!user;
  const navItems = visibleNavItems(isSignedIn);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex h-full min-w-0 shrink-0 items-center">
          <Link href="/" className="flex h-full items-center">
            <Image
              src={logo}
              alt="Biollector logo"
              className="h-full w-auto p-3"
              quality={100}
              loading="eager"
            />
          </Link>
        </div>

        <ul className="hidden min-w-0 flex-1 list-none items-center justify-center gap-1 md:flex">
          {navItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <Separator
                  orientation="vertical"
                  className="h-4 self-center shrink-0"
                />
              )}
              <NavLink href={item.href} variant="desktop">
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center md:flex">
          <UserButton />
        </div>

        <NavbarMobileMenu isSignedIn={isSignedIn} className="md:hidden" />
      </div>
    </nav>
  );
}
