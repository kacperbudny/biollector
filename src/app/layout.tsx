import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/styles/cn";

const font = Montserrat({
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
    <html lang="en" className="dark" data-theme="dark">
      <body className={cn(font.className, "bg-background text-foreground")}>
        <Providers>
          <Navbar />
          <main className="container mx-auto max-w-[1440px] grow px-6 py-8">
            {children}
          </main>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
