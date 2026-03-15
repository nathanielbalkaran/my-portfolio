"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketTicker } from "@/components/MarketTicker";
import { LocaleToggle } from "@/components/LocaleToggle";

export type ActiveLink = "home" | "market research" | "initiatives" | "info" | null;

const NAV_LINKS = [
  { href: "/finance", activeSlug: "market research" as const },
  { href: "/initiatives", activeSlug: "initiatives" as const },
  { href: "/info", activeSlug: "info" as const },
] as const;

type SiteHeaderProps = {
  activeLink: ActiveLink;
};

export function SiteHeader({ activeLink }: SiteHeaderProps) {
  const t = useTranslations("common");

  return (
    <header className="border-b border-gray-700 bg-background font-sans">
      <div className="flex flex-wrap items-stretch">
        <div className="flex w-[9.5rem] shrink-0 items-center border-r border-gray-700 px-4 py-0">
          <Link
            href="/"
            className="font-sans text-sm font-bold tracking-tighter text-foreground transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1"
          >
            {t("siteName")}
          </Link>
        </div>
        <div className="flex shrink-0">
          {NAV_LINKS.map(({ href, activeSlug }) => {
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
                  className={`flex items-center px-4 py-0 font-mono text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:bg-white hover:text-black ${
                    isActive ? "bg-foreground/10 text-foreground" : "text-foreground/80"
                  }`}
                >
                  {t(labelKey)}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="ml-auto flex shrink-0 items-stretch border-l border-gray-700">
          <div className="flex w-[5rem] shrink-0 border-r border-gray-700">
            <LocaleToggle />
          </div>
          <div className="flex w-[3.75rem] shrink-0 border-r-0 border-gray-700">
            <div className="flex w-full items-center justify-center border-l border-gray-700 py-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <MarketTicker />
      </div>
    </header>
  );
}
