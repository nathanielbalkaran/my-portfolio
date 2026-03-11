"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      className={`flex items-center justify-between border-b border-foreground/10 bg-background/80 py-4 px-8 backdrop-blur ${useSerifFont ? "font-serif" : "font-sans"}`}
    >
      <Link
        href="/"
        className="text-lg font-semibold text-foreground transition-opacity hover:opacity-90"
      >
        Nathaniel Balkaran
      </Link>
      <div className="flex items-center gap-4">
        <nav className="flex gap-6 text-sm">
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
    </header>
  );
}
