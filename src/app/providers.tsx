"use client";

import { Toast } from "@heroui/react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <Toast.Provider />
        {children}
      </StackTheme>
    </StackProvider>
  );
}
