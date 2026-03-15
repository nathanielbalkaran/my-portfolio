"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

export function LocaleToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === "en" ? "fr" : "en";

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="group flex flex-1 items-center justify-center gap-1 font-mono text-xs font-medium uppercase tracking-widest text-foreground/80 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:bg-white hover:text-black py-3 px-3"
      aria-label={locale === "en" ? "Passer en français" : "Switch to English"}
    >
      <span
        className={
          locale === "en"
            ? "font-bold text-foreground group-hover:text-black"
            : "text-foreground/60 group-hover:text-black/70"
        }
      >
        EN
      </span>
      <span
        className="text-foreground/40 group-hover:text-black/50"
        aria-hidden
      >
        ·
      </span>
      <span
        className={
          locale === "fr"
            ? "font-bold text-foreground group-hover:text-black"
            : "text-foreground/60 group-hover:text-black/70"
        }
      >
        FR
      </span>
    </button>
  );
}
