"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { siteContent } from "@/data/site-content";

export type ActiveLink = "home" | "about" | "lab" | null;

const NAV_LINKS = [
  { href: "/", activeSlug: "home" as const, labelKey: "home" as const },
  { href: "/about", activeSlug: "about" as const, labelKey: "about" as const },
  { href: "/lab", activeSlug: "lab" as const, labelKey: "lab" as const },
] as const;

type HeaderProps = {
  activeLink: ActiveLink;
};

export function Header({ activeLink }: HeaderProps) {
  const { common } = siteContent;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  const linkLabel = (labelKey: (typeof NAV_LINKS)[number]["labelKey"]) => {
    if (labelKey === "home") return common.siteName;
    return common[labelKey];
  };

  return (
    <header className="w-full min-w-0 max-w-full overflow-x-clip border-b border-gray-700 bg-background font-sans">
      <div className="flex w-full min-w-0 max-w-full flex-nowrap items-stretch">
        <div className="flex min-h-[44px] min-w-0 flex-1 items-center border-r border-gray-700 px-4 py-0 md:w-[9.5rem] md:flex-none md:shrink-0">
          <Link
            href="/"
            className="block min-w-0 max-w-full truncate font-sans text-sm font-bold tracking-tighter text-foreground transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1"
          >
            {common.siteName}
          </Link>
        </div>

        <div className="hidden shrink-0 md:flex">
          {NAV_LINKS.filter((l) => l.activeSlug !== "home").map(
            ({ href, activeSlug, labelKey }) => {
              const isActive = activeLink === activeSlug;
              return (
                <div
                  key={href}
                  className="flex shrink-0 border-r border-gray-700"
                >
                  <Link
                    href={href}
                    className={`flex min-h-[44px] items-center px-4 py-0 font-mono text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:bg-white hover:text-black ${
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "text-foreground/80"
                    }`}
                  >
                    {common[labelKey]}
                  </Link>
                </div>
              );
            },
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-stretch border-l border-gray-700 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="font-mono text-xs font-medium uppercase tracking-widest text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center px-4 transition-colors hover:bg-foreground/10"
            aria-label={common.menu}
            aria-expanded={menuOpen}
          >
            [ MENU ]
          </button>
        </div>
      </div>

      <div
        className="fixed inset-0 z-50 md:hidden"
        aria-hidden={!menuOpen}
        style={{ pointerEvents: menuOpen ? "auto" : "none" }}
      >
        <div
          className="absolute inset-0 bg-black/60 transition-opacity duration-200"
          style={{
            backgroundColor: menuOpen ? "rgba(0,0,0,0.6)" : "transparent",
          }}
          onClick={closeMenu}
          aria-hidden
        />
        <div
          className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-gray-700 bg-background transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          <div className="flex flex-col">
            {NAV_LINKS.map(({ href, activeSlug, labelKey }) => {
              const isActive = activeLink === activeSlug;
              return (
                <div key={href} className="border-b border-gray-700">
                  <Link
                    href={href}
                    prefetch={false}
                    onClick={closeMenu}
                    className={`flex min-h-[44px] w-full min-w-0 items-center break-words px-6 font-mono text-xs font-medium uppercase tracking-widest transition-colors hover:bg-white hover:text-black ${
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "text-foreground/90"
                    }`}
                  >
                    {linkLabel(labelKey)}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
