"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { Drawer, Separator, useOverlayState } from "@heroui/react";
import { UserButton } from "@stackframe/stack";
import { Fragment } from "react";
import { NavLink, visibleNavItems } from "@/components/layout/navbar-links";
import { cn } from "@/styles/cn";

type NavbarMobileMenuProps = {
  isSignedIn: boolean;
  className?: string;
};

export function NavbarMobileMenu({
  isSignedIn,
  className,
}: NavbarMobileMenuProps) {
  const overlayState = useOverlayState();
  const items = visibleNavItems(isSignedIn);

  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      <Drawer state={overlayState}>
        <Drawer.Trigger
          aria-label="Open menu"
          className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-default"
        >
          <Bars3Icon className="h-6 w-6" />
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="right" className="z-60 max-w-sm">
            <Drawer.Dialog>
              <Drawer.CloseTrigger aria-label="Close menu" />
              <Drawer.Header>
                <Drawer.Heading>Menu</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <nav className="flex flex-col gap-1 pt-2">
                  {items.map((item, index) => (
                    <Fragment key={item.href}>
                      {index > 0 && <Separator />}
                      <NavLink
                        href={item.href}
                        variant="mobile"
                        onNavigate={() => overlayState.close()}
                      >
                        {item.label}
                      </NavLink>
                    </Fragment>
                  ))}
                </nav>
              </Drawer.Body>
              <Drawer.Footer className="border-t border-border pt-4">
                <div className="flex justify-center">
                  <UserButton />
                </div>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
