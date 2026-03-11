"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const financeNavItems = [
  { href: "/", label: "Home" },
  { href: "/finance", label: "Pitches" },
  { href: "/about", label: "About" },
  { href: "mailto:hello@example.com", label: "Contact", external: false },
];

export function FinanceNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#0a192f]/10 bg-[#faf9f7]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-sm font-semibold tracking-tight text-[#0a192f]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#0a192f]/20 bg-[#0a192f] font-serif text-xs font-medium text-[#faf9f7]">
            NB
          </span>
          <span className="hidden sm:inline">Nathaniel Balkaran</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-[#0a192f]/10 px-2 py-1.5 font-serif text-sm text-[#0a192f]/80 hover:bg-[#0a192f]/5 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden items-center gap-8 font-serif text-sm text-[#0a192f]/80 sm:flex">
          {financeNavItems.map((item) => {
            const isActive = !item.external && pathname === item.href;
            const current = isActive || (item.href === "/finance" && pathname.startsWith("/finance"));
            return (
              <Link
                key={item.href}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={
                  current
                    ? "font-semibold text-[#0a192f]"
                    : "transition-colors hover:text-[#0a192f]"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {open && (
        <div className="border-t border-[#0a192f]/10 bg-[#faf9f7] sm:hidden">
          <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 py-3 font-serif text-sm text-[#0a192f]/80 sm:px-6 lg:px-8">
            {financeNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="rounded border border-transparent px-2 py-1.5 hover:bg-[#0a192f]/5 hover:text-[#0a192f]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
