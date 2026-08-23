import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { stackServerApp } from "@/auth/server";
import { NavLink } from "@/components/layout/navbar-links";
import { visibleNavItems } from "@/components/layout/navbar-menu";
import { NavbarMobileMenu } from "@/components/layout/navbar-mobile-menu";
import { NavbarScrollSurface } from "@/components/layout/navbar-scroll-surface";
import { NavbarSearch } from "@/components/layout/navbar-search";

export async function Navbar() {
  const user = await stackServerApp.getUser();
  const isSignedIn = !!user;
  const navItems = visibleNavItems(isSignedIn);

  return (
    <NavbarScrollSurface>
      <div className="relative mx-auto flex h-16 max-w-360 items-center justify-between gap-4 px-6">
        <div className="flex h-full min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-full shrink-0 origin-center items-center transition-transform duration-200 ease-out hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <Image
              src={logo}
              alt="Biollector logo"
              className="h-14 w-auto p-3 invert"
              quality={100}
              loading="eager"
            />
          </Link>
          <NavbarSearch variant="desktop" />
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden shrink-0 items-center gap-8 md:flex"
        >
          <ul className="flex list-none items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href} className="flex items-center gap-1">
                <NavLink href={item.href} variant="desktop">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <UserButton />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <NavbarSearch variant="mobile" />
          <NavbarMobileMenu isSignedIn={isSignedIn} />
        </div>
      </div>
    </NavbarScrollSurface>
  );
}
