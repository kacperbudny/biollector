"use client";

import { RouterProvider, Toast } from "@heroui/react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { stackClientApp } from "@/auth/client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider navigate={router.push}>
        <NuqsAdapter>
          <StackProvider app={stackClientApp}>
            <StackTheme>
              <Toast.Provider />
              {children}
            </StackTheme>
          </StackProvider>
        </NuqsAdapter>
      </RouterProvider>
    </QueryClientProvider>
  );
}
