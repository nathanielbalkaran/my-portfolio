/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/marketing-projects", label: "Marketing Projects" },
  { href: "/finance", label: "Pitches" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-finance-navy"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-finance-navy text-xs font-bold text-background">
            NB
          </span>
          <span className="hidden text-sm sm:inline">Nathaniel Balkaran</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-finance-navy/80 ring-1 ring-black/10 hover:bg-black/5 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span>Menu</span>
        </button>

        <div className="hidden items-center gap-6 text-sm text-finance-navy/75 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-emerald"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {open && (
        <div className="border-t border-black/10 bg-background sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col space-y-1 px-4 py-3 text-sm text-finance-navy/75 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1.5 hover:bg-black/5 hover:text-emerald"
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

