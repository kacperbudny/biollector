import "@/styles/globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/layout/navbar";

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
    <html lang="en">
      <body className={font.className}>
        <Providers>
          <Navbar />
          <main className="container mx-auto max-w-7xl px-6 flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
