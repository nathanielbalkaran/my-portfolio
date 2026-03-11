import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

const bodySans = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
  display: "swap",
});

const headingSerif = Playfair_Display({
  variable: "--font-heading-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nathaniel Balkaran | Portfolio",
  description:
    "Portfolio showcasing marketing projects and capital markets stock pitches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bodySans.variable} ${headingSerif.variable} min-h-screen bg-background text-finance-navy antialiased`}
      >
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
          <div className="relative z-30 shrink-0">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}