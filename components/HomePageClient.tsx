"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import {
  ScrollReveal,
} from "@/components/ScrollReveal";
import { ExperienceEntries } from "@/components/ExperienceEntries";

const snappy = {
  type: "tween" as const,
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

const TYPEWRITER_DURATION_MS = 400;

export function HomePageClient() {
  const [nameObfuscated, setNameObfuscated] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const t = useTranslations("home");
  const fullName = t("name");
  const obfuscated = t("nameObfuscated");
  const len = Math.min(fullName.length, obfuscated.length);

  useEffect(() => {
    if (!nameObfuscated) {
      return undefined;
    }
    const start = performance.now();
    const run = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / TYPEWRITER_DURATION_MS, 1);
      setTypewriterIndex(Math.floor(progress * (len + 1)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(run);
      }
    };
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [nameObfuscated, len]);

  const displayName =
    !nameObfuscated || typewriterIndex === 0
      ? fullName
      : Array.from({ length: len }, (_, i) =>
          i < typewriterIndex ? obfuscated[i] : fullName[i],
        ).join("") + fullName.slice(len);

  return (
    <main
      className="relative flex min-h-screen min-w-0 max-w-full flex-col overflow-x-clip"
      aria-labelledby="home-page-heading"
    >
      <header className="relative z-10">
        <SiteHeader activeLink="home" />
      </header>

      <div className="page-wrapper w-full min-w-0 max-w-5xl">
        <header className="pb-8 text-left">
          <ScrollReveal>
            <motion.h1 id="home-page-heading">
              <Link
                href="/info"
                className="inline-block max-w-full origin-left break-words font-sans text-4xl font-bold tracking-tighter uppercase leading-tight text-foreground transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none hover:text-[#FF7518] sm:text-7xl md:text-8xl sm:leading-none"
                onMouseEnter={() => setNameObfuscated(true)}
                onMouseLeave={() => {
                  setNameObfuscated(false);
                  setTypewriterIndex(0);
                }}
              >
                {displayName}
              </Link>
            </motion.h1>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <p className="font-mono text-sm text-gray-400 tracking-tight">
              {t("tagline")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.075}>
            <div>
              <Link
                href="/info"
                className="group mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-gray-500 transition-colors hover:text-foreground"
              >
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
                {t("learnMore")}
              </Link>
            </div>
          </ScrollReveal>
        </header>

        <motion.section
          className="mb-20 grid min-w-0 max-w-full grid-cols-1 gap-0 md:grid-cols-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.1 }}
        >
          <div className="min-w-0 border-t border-border border-r-0 py-8 pr-8 md:col-span-2 md:border-r md:border-r-border md:pr-12">
            <ScrollReveal>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                {t("experience")}
              </h2>
            </ScrollReveal>
            <ExperienceEntries variant="home" />
          </div>
          <div className="min-w-0 border-t border-border py-8 pl-0 pr-0 md:col-span-1 md:pl-12 md:pr-0">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
              {t("education")}
            </h2>
            <a
              href="https://www.linkedin.com/in/nathanielbalkaran"
              target="_blank"
              rel="noopener noreferrer"
              className="group/edu flex min-h-[44px] items-center gap-3 rounded-none py-2 pr-2 -mr-2 -mt-2 transition-colors duration-200 hover:bg-foreground/10 w-fit"
              aria-label={t("educationSchool")}
            >
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/logos/western-crest.png"
                  alt="Western University crest"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                />
              </div>
              <p className="font-sans font-bold text-lg text-foreground group-hover/edu:text-foreground">
                {t("educationSchool")}
              </p>
            </a>
            <p className="font-sans text-foreground/80 mt-1">
              {t("educationProgram")}
            </p>
            <p className="font-mono text-sm text-gray-500 mt-1">
              {t("educationYear")}
            </p>
            <p className="mt-3 font-sans text-sm text-foreground/70">
              <a
                href="https://www.embark.ca/embark-student-foundation"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                {t("educationAward1")}
              </a>
              , {t("educationAward2")}
            </p>
          </div>
        </motion.section>

        <motion.nav
          className="border-t border-border"
          aria-label={t("mainNavLabel")}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.15 }}
        >
          <ul className="flex flex-col">
            <li>
              <Link
                href="/finance"
                className="group flex min-h-[44px] min-w-0 max-w-full flex-wrap items-center gap-3 break-words font-sans text-4xl font-bold tracking-tighter text-foreground transition-all duration-200 ease-snappy hover:translate-x-1 hover:bg-terminal-green hover:py-3 hover:pl-6 hover:text-white sm:text-5xl md:text-7xl"
              >
                {t("navMarketResearch")}
                <ArrowRight
                  className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 md:h-9 md:w-9"
                  aria-hidden
                />
              </Link>
            </li>
            <li>
              <Link
                href="/info"
                className="group flex min-h-[44px] min-w-0 max-w-full flex-wrap items-center gap-3 break-words font-sans text-4xl font-bold tracking-tighter text-foreground transition-all duration-200 ease-snappy hover:translate-x-1 hover:bg-foreground hover:py-3 hover:pl-6 hover:text-background sm:text-5xl md:text-7xl"
              >
                {t("navInfo")}
                <ArrowRight
                  className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 md:h-9 md:w-9"
                  aria-hidden
                />
              </Link>
            </li>
          </ul>
        </motion.nav>
      </div>
    </main>
  );
}

