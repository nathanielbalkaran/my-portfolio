"use client";

import Link from "next/link";
import { externalLinks, siteContent } from "@/data/site-content";

const linkClass =
  "font-mono text-xs tracking-widest text-foreground flex min-h-[44px] items-center py-1 px-1 -mx-1 rounded-none transition-colors duration-200 ease-snappy hover:bg-foreground hover:text-background";

export function Footer() {
  const t = siteContent.footer;

  const pages = [
    { href: "/", label: t.home },
    { href: "/about", label: t.about },
    { href: "/lab", label: t.lab },
  ];

  const social = [
    { href: externalLinks.linkedIn, label: t.linkedin },
    { href: externalLinks.email, label: t.emailLabel },
    { href: externalLinks.strava, label: t.strava },
  ];

  return (
    <footer className="relative w-full min-w-0 max-w-full overflow-x-clip border-t border-border bg-background text-foreground rounded-none">
      <div className="border-b border-border px-4 py-5 md:px-5">
        <a
          href={externalLinks.email}
          className="block min-h-[44px] min-w-0 max-w-full break-words rounded-none px-1 py-1 font-sans text-5xl font-bold tracking-tighter lowercase transition-colors duration-200 ease-snappy hover:bg-foreground hover:text-background md:text-6xl -mx-1"
        >
          {t.email}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="border-b border-r-0 border-border px-4 py-4 md:border-r md:border-b-0 md:px-5 md:py-4">
          <p className="font-sans font-bold tracking-tight text-foreground lowercase">
            {t.name}
          </p>
          <p className="font-mono text-xs text-foreground/60 mt-1.5 tracking-wide">
            {t.copyright}
          </p>
          <a
            href="https://youtube.com/shorts/QuKVuuIfcE0?si=86gJe6n7YC_i67kS"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Easter egg"
            className="font-mono text-xs text-foreground/50 hover:text-foreground/70 mt-1.5 inline-block"
          >
            &gt;&lt;(((*&gt;
          </a>
        </div>

        <nav
          className="border-b border-r-0 border-border px-4 py-4 md:border-r md:border-b-0 md:px-5 md:py-4"
          aria-label="Footer pages"
        >
          <ul className="space-y-0">
            {pages.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-b border-r-0 border-border px-4 py-4 md:border-r md:border-b-0 md:px-5 md:py-4">
          <ul className="space-y-0">
            {social.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className={linkClass}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border px-4 py-4 md:px-5 md:py-4">
          <div className="font-mono text-xs text-foreground/60 tracking-wide space-y-0.5">
            <p>{t.builtWith}</p>
            <p>{t.deployed}</p>
            <p>{t.help}</p>
            <p>
              <a
                href={externalLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground underline"
              >
                {t.version}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
