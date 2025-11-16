import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";

export function Navbar() {
  return (
    <HeroUINavbar isBordered>
      <NavbarBrand>
        <Link href="/">
          <h1 className="font-bold text-inherit">BIOLLECTOR</h1>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <UserButton />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
}
