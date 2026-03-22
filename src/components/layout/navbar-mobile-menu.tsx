"use client";

import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Button, Drawer, Separator, useOverlayState } from "@heroui/react";
import { useStackApp, useUser } from "@stackframe/stack";
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
                <div className="w-full rounded-xl border border-border bg-default/50 p-2">
                  <MobileUserActions onDone={() => overlayState.close()} />
                </div>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}

function MobileUserActions({ onDone }: { onDone: () => void }) {
  const app = useStackApp();
  const user = useUser();

  async function handleAccountSettings() {
    onDone();
    await app.redirectToAccountSettings();
  }

  async function handleSignIn() {
    onDone();
    await app.redirectToSignIn();
  }

  async function handleSignUp() {
    onDone();
    await app.redirectToSignUp();
  }

  async function handleSignOut() {
    onDone();
    await user?.signOut();
  }

  if (user) {
    return (
      <div className="space-y-2">
        <div className="px-1 py-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.displayName ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-muted">{user.primaryEmail}</p>
        </div>
        <Button
          variant="tertiary"
          className="w-full justify-start"
          onPress={handleAccountSettings}
        >
          <Cog6ToothIcon className="h-4 w-4" />
          Account settings
        </Button>
        <Button
          variant="tertiary"
          className="w-full justify-start text-danger"
          onPress={handleSignOut}
        >
          <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="tertiary"
        className="w-full justify-start bg-accent text-white hover:bg-accent/90"
        onPress={handleSignIn}
      >
        <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
        Sign in
      </Button>
      <Button
        variant="tertiary"
        className="w-full justify-start"
        onPress={handleSignUp}
      >
        <UserPlusIcon className="h-4 w-4" />
        Sign up
      </Button>
    </div>
  );
}
