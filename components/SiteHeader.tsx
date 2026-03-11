"use client";

import Link from "next/link";

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
      className={`flex justify-between items-center py-4 px-8 border-b border-gray-200 ${useSerifFont ? "font-serif" : "font-sans"}`}
    >
      <Link href="/" className="text-lg font-semibold text-black hover:opacity-90">
        Nathaniel Balkaran
      </Link>
      <nav className="flex gap-6 text-sm">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = activeLink === (label.toLowerCase() as ActiveLink);
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? "font-semibold text-black" : "text-gray-500 hover:text-black"}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
