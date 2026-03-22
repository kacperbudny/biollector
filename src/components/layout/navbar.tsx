import { Separator } from "@heroui/react";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { stackServerApp } from "@/auth/server";

export async function Navbar() {
  const user = await stackServerApp.getUser();
  const isSignedIn = !!user;

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
            />
          </Link>
        </div>

        <ul className="flex min-w-0 flex-1 items-center justify-center gap-1">
          <li>
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent"
            >
              Home
            </Link>
          </li>

          <Separator orientation="vertical" className="h-4" />

          <li>
            <Link
              href="/sets"
              className="rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent"
            >
              Sets
            </Link>
          </li>

          {isSignedIn && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <li>
                <Link
                  href="/collection"
                  className="rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent"
                >
                  Collection
                </Link>
              </li>
              <Separator orientation="vertical" className="h-4" />
              <li>
                <Link
                  href="/wishlist"
                  className="rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent"
                >
                  Wishlist
                </Link>
              </li>
              <Separator orientation="vertical" className="h-4" />
              <li>
                <Link
                  href="/recommendations"
                  className="rounded-md px-3 py-2 text-foreground transition-colors hover:text-accent"
                >
                  Recommendations
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="flex shrink-0 items-center">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
