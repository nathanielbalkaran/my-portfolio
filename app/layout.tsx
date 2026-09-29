import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const fontSans = Space_Grotesk({
  variable: "--font-sans-family",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nathaniel Balkaran",
  description: "Personal website of Nathaniel Balkaran.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} min-h-screen min-w-0 max-w-full overflow-x-clip text-foreground antialiased`}
      >
        <div className="relative z-10 flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)]">
          <main className="min-w-0 w-full max-w-full flex-1 pb-24 md:pb-28 lg:pb-32">
            {children}
          </main>
          <div className="relative z-30 shrink-0">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
