"use client";

import { useLayoutEffect, useState } from "react";
import { cn } from "@/styles/cn";

const SCROLL_THRESHOLD_PX = 8;

type NavbarScrollSurfaceProps = {
  children: React.ReactNode;
};

export function NavbarScrollSurface({ children }: NavbarScrollSurfaceProps) {
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,backdrop-filter,border-color] duration-300 ease-out motion-reduce:transition-none",
        scrolled
          ? "border-border bg-neutral-950/80 backdrop-blur-md"
          : "border-transparent bg-transparent backdrop-blur-none",
      )}
    >
      {children}
    </nav>
  );
}
