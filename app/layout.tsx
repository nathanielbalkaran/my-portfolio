import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StarsBackground } from "@/components/StarsBackground";

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
  title: "Nathaniel Balkaran | Portfolio",
  description:
    "Portfolio showcasing projects and capital markets stock pitches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} min-h-screen text-foreground antialiased`}
      >
        <ThemeProvider>
          <div
            className="fixed inset-0 z-[-1] h-full w-full hidden dark:block"
            aria-hidden
          >
            <StarsBackground />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
