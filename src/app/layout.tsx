import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { Providers } from "@/app/providers";
import { stackServerApp } from "@/auth/server";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Biollector", template: "%s | Biollector" },
  description: "Manage your Bionicle collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Providers>
              <Navbar />
              <main className="container mx-auto max-w-7xl px-6 flex-grow">
                {children}
              </main>
            </Providers>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
