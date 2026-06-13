"use client";

import { Toast } from "@heroui/react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { stackClientApp } from "@/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <Toast.Provider />
          {children}
        </StackTheme>
      </StackProvider>
    </NuqsAdapter>
  );
}
