"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketTicker } from "@/components/MarketTicker";
import { LocaleToggle } from "@/components/LocaleToggle";

export type ActiveLink =
  | "home"
  | "market research"
  | "initiatives"
  | "info"
  | null;

const NAV_LINKS = [
  { href: "/", activeSlug: "home" as const },
  { href: "/finance", activeSlug: "market research" as const },
  { href: "/initiatives", activeSlug: "initiatives" as const },
  { href: "/info", activeSlug: "info" as const },
] as const;

type SiteHeaderProps = {
  activeLink: ActiveLink;
};

export function SiteHeader({ activeLink }: SiteHeaderProps) {
  const t = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);
  /** Drawer links use next/link + prefetch/observer; render after mount to avoid SSR/client HTML drift. */
  const [drawerLinksReady, setDrawerLinksReady] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setDrawerLinksReady(true);
  }, []);

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

  const linkLabel = (activeSlug: (typeof NAV_LINKS)[number]["activeSlug"]) => {
    if (activeSlug === "home") return t("siteName");
    if (activeSlug === "market research") return t("marketResearch");
    if (activeSlug === "initiatives") return t("initiatives");
    return t("info");
  };

  return (
    <header className="w-full min-w-0 max-w-full overflow-x-clip border-b border-gray-700 bg-background font-sans">
      <div className="flex w-full min-w-0 max-w-full flex-nowrap items-stretch">
        <div className="flex min-h-[44px] min-w-0 flex-1 items-center border-r border-gray-700 px-4 py-0 md:w-[9.5rem] md:flex-none md:shrink-0">
          <Link
            href="/"
            className="block min-w-0 max-w-full truncate font-sans text-sm font-bold tracking-tighter text-foreground transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1"
          >
            {t("siteName")}
          </Link>
        </div>

        {/* Desktop nav: visible from md up */}
        <div className="hidden shrink-0 md:flex">
          {NAV_LINKS.filter((l) => l.activeSlug !== "home").map(
            ({ href, activeSlug }) => {
              const isActive = activeLink === activeSlug;
              const labelKey =
                activeSlug === "market research"
                  ? "marketResearch"
                  : activeSlug === "initiatives"
                    ? "initiatives"
                    : "info";
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
                    {t(labelKey)}
                  </Link>
                </div>
              );
            },
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-stretch border-l border-gray-700">
          {/* Mobile: [ MENU ] button — sharp 1px border square, IBM Plex Mono */}
          <div className="flex shrink-0 border-r border-gray-700 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="font-mono text-xs font-medium uppercase tracking-widest text-foreground border-0 border-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center px-4 transition-colors hover:bg-foreground/10"
              aria-label={t("menu")}
              aria-expanded={menuOpen}
            >
              [ MENU ]
            </button>
          </div>
          {/* EN/FR toggle: hidden on mobile (moved into drawer), visible from md up */}
          <div className="hidden min-h-[44px] w-[5rem] shrink-0 border-r border-gray-700 md:flex">
            <LocaleToggle />
          </div>
          <div className="flex min-h-[44px] w-[3.75rem] shrink-0 border-r-0 border-gray-700">
            <div className="flex w-full items-center justify-center border-l border-gray-700 py-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <MarketTicker />
      </div>

      {/* Mobile drawer: theme background so foreground text stays readable in light & dark */}
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
          className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-gray-700 bg-background shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          {drawerLinksReady ? (
            <div className="flex flex-col">
              {NAV_LINKS.map(({ href, activeSlug }) => {
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
                      {linkLabel(activeSlug)}
                    </Link>
                  </div>
                );
              })}
              <div className="border-b border-gray-700">
                <div className="flex min-h-[44px] items-center justify-center gap-2 px-6 py-2">
                  <LocaleToggle />
                </div>
              </div>
              <div className="border-b border-gray-700">
                <div className="flex min-h-[44px] items-center justify-center px-6 py-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
