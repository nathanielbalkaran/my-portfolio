"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketTicker } from "@/components/MarketTicker";

export type ActiveLink = "home" | "pitches" | "marketing" | "about" | null;

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/finance", label: "Pitches" },
  { href: "/marketing", label: "Marketing" },
  { href: "/about", label: "About" },
] as const;

type SiteHeaderProps = {
  activeLink: ActiveLink;
  useSerifFont?: boolean;
};

export function SiteHeader({ activeLink, useSerifFont = false }: SiteHeaderProps) {
  return (
    <header
      className={`border-b border-foreground/10 bg-background/80 backdrop-blur ${useSerifFont ? "font-serif" : "font-sans"}`}
    >
      <div className="flex items-center justify-between py-2 px-6">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          Nathaniel Balkaran
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex gap-4 text-sm">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = activeLink === (label.toLowerCase() as ActiveLink);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-foreground/70 transition-colors hover:text-foreground"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
      <MarketTicker />
    </header>
  );
}
