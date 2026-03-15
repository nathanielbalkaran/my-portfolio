"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const linkClass =
  "font-mono text-xs tracking-widest text-foreground block py-1 px-1 -mx-1 rounded-none transition-colors duration-200 ease-snappy hover:bg-foreground hover:text-background";

export function Footer() {
  const t = useTranslations("footer");

  const pages = [
    { href: "/", labelKey: "home" },
    { href: "/finance", labelKey: "marketResearch" },
    { href: "/initiatives", labelKey: "initiatives" },
    { href: "/info", labelKey: "info" },
  ];

  const social = [
    { href: "https://www.linkedin.com/in/nathanielbalkaran", labelKey: "linkedin" as const },
    { href: "mailto:nbalkar2@uwo.ca", labelKey: "emailLabel" as const },
    { href: "https://www.strava.com/athletes/85417714", labelKey: "strava" as const },
  ];

  return (
    <footer className="relative w-full border-t border-border bg-background text-foreground rounded-none">
      <div className="border-b border-border px-4 py-5 md:px-5">
        <a
          href="mailto:nbalkar2@uwo.ca"
          className="font-sans text-5xl md:text-6xl font-bold tracking-tighter lowercase block hover:bg-foreground hover:text-background transition-colors duration-200 ease-snappy py-1 px-1 -mx-1 rounded-none w-fit"
        >
          {t("email")}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="border-b border-r-0 border-border px-4 py-4 md:border-r md:border-b-0 md:px-5 md:py-4">
          <p className="font-sans font-bold tracking-tight text-foreground lowercase">
            {t("name")}
          </p>
          <p className="font-mono text-xs text-foreground/60 mt-1.5 tracking-wide">
            {t("copyright")}
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
            {pages.map(({ href, labelKey }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-b border-r-0 border-border px-4 py-4 md:border-r md:border-b-0 md:px-5 md:py-4">
          <ul className="space-y-0">
            {social.map(({ href, labelKey }) => (
              <li key={labelKey}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className={linkClass}
                >
                  {t(labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border px-4 py-4 md:px-5 md:py-4">
          <div className="font-mono text-xs text-foreground/60 tracking-wide space-y-0.5">
            <p>{t("builtWith")}</p>
            <p>{t("deployed")}</p>
            <p>
              {t("marketData")}{" "}
              <a
                href="https://finnhub.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground underline"
              >
                {t("finnhub")}
              </a>
              .
            </p>
            <p>{t("help")}</p>
            <p>
              <a
                href="https://github.com/nathanielbalkaran"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground underline"
              >
                {t("version")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
