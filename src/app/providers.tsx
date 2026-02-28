"use client";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { stackClientApp } from "@/auth/client";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <HeroUIProvider navigate={router.push}>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      </StackTheme>
    </StackProvider>
  );
}
