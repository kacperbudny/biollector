import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";

export function Navbar() {
  return (
    <HeroUINavbar isBordered>
      <NavbarBrand className="h-full">
        <Link href="/" className="flex h-full items-center">
          <Image
            src={logo}
            alt="Biollector logo"
            className="h-full w-auto p-3"
            quality={100}
          />
        </Link>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/sets" className="text-foreground hover:text-primary transition-colors">
            Sets
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <UserButton />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
}
