"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";

const snappy = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

const TYPEWRITER_DURATION_MS = 400;

const EXPERIENCE = [
  { company: "Polymarket", roleKey: "polymarketRole", yearKey: "polymarketYear", logoSrc: "/logos/polymarket.png" },
  { company: "180 Degrees Consulting", roleKey: "180dcRole", yearKey: "180dcYear", logoSrc: "/logos/180dc.png" },
  { company: "Blue Canoe Brands", roleKey: "blueCanoeRole", yearKey: "blueCanoeYear", logoSrc: "/logos/blue-canoe-brands.png" },
  { company: "Project WhyFi", roleKey: "whyfiRole", yearKey: "whyfiYear", logoSrc: "/logos/project-whyfi.png" },
  { company: "City of Markham", roleKey: "markhamRole", yearKey: "markhamYear", logoSrc: "/logos/city-of-markham.png" },
];

export default function Page() {
  const [nameObfuscated, setNameObfuscated] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const t = useTranslations("home");
  const tExp = useTranslations("homeExperience");

  const fullName = t("name");
  const obfuscated = t("nameObfuscated");
  const len = Math.min(fullName.length, obfuscated.length);

  useEffect(() => {
    if (!nameObfuscated) {
      setTypewriterIndex(0);
      return;
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
          i < typewriterIndex ? obfuscated[i] : fullName[i]
        ).join("") + fullName.slice(len);

  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="relative z-10">
        <SiteHeader activeLink="home" />
      </header>

      <div className="page-wrapper w-full max-w-5xl">
        <header className="pb-8 text-left">
          <motion.h1
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0 }}
          >
            <Link
              href="/info"
              className="inline-block origin-left font-sans text-4xl font-bold tracking-tighter uppercase leading-tight text-foreground transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none hover:text-[#FF7518] sm:text-7xl md:text-8xl sm:leading-none"
              onMouseEnter={() => setNameObfuscated(true)}
              onMouseLeave={() => setNameObfuscated(false)}
            >
              {displayName}
            </Link>
          </motion.h1>
          <motion.p
            className="font-mono text-sm text-gray-400 tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0.05 }}
          >
            {t("tagline")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0.075 }}
          >
            <Link
              href="/info"
              className="group mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-gray-500 transition-colors hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              {t("learnMore")}
            </Link>
          </motion.div>
        </header>

        <motion.section
          className="grid grid-cols-1 gap-0 mb-20 md:grid-cols-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.1 }}
        >
          <div className="border-t border-border border-r-0 py-8 pr-8 md:col-span-2 md:border-r md:border-r-border md:pr-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
              {t("experience")}
            </h2>
            <ul className="space-y-0.5">
              {EXPERIENCE.map((item) => (
                <li key={`${item.company}-${item.yearKey}`}>
                  <a
                    href="https://www.linkedin.com/in/nathanielbalkaran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/exp flex min-h-[44px] flex-wrap items-center gap-x-2 gap-y-0 rounded-none py-2 pr-2 -mr-2 transition-colors duration-200 hover:bg-foreground/10"
                  >
                    <span className="relative h-6 w-6 shrink-0 overflow-hidden">
                      <Image
                        src={item.logoSrc}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </span>
                    <span className="font-sans font-bold text-foreground group-hover/exp:text-foreground">{item.company}</span>
                    <span className="text-gray-500">·</span>
                    <span className="font-sans text-foreground/80 group-hover/exp:text-foreground/90">{tExp(item.roleKey)}</span>
                    <span className="text-gray-500">·</span>
                    <span className="font-mono text-sm text-gray-500 group-hover/exp:text-gray-400">{tExp(item.yearKey)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-border py-8 pl-0 pr-0 md:col-span-1 md:pl-12 md:pr-0">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
              {t("education")}
            </h2>
            <a
              href="https://www.linkedin.com/in/nathanielbalkaran"
              target="_blank"
              rel="noopener noreferrer"
              className="group/edu flex min-h-[44px] items-center gap-3 rounded-none py-2 pr-2 -mr-2 -mt-2 transition-colors duration-200 hover:bg-foreground/10 w-fit"
            >
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/logos/western-crest.png"
                  alt="Western University crest"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <p className="font-sans font-bold text-lg text-foreground group-hover/edu:text-foreground">{t("educationSchool")}</p>
            </a>
            <p className="font-sans text-foreground/80 mt-1">{t("educationProgram")}</p>
            <p className="font-mono text-sm text-gray-500 mt-1">{t("educationYear")}</p>
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
          aria-label="Main"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.15 }}
        >
          <ul className="flex flex-col">
            <li>
              <Link
                href="/finance"
                className="group flex min-h-[44px] items-center gap-3 font-sans text-4xl font-bold tracking-tighter text-foreground transition-all duration-200 ease-snappy hover:translate-x-1 hover:bg-terminal-green hover:py-3 hover:pl-6 hover:text-white sm:text-5xl md:text-7xl"
              >
                {t("navMarketResearch")}
                <ArrowRight className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 md:h-9 md:w-9" aria-hidden />
              </Link>
            </li>
            <li>
              <Link
                href="/initiatives"
                className="group flex min-h-[44px] items-center gap-3 font-sans text-4xl font-bold tracking-tighter text-foreground transition-all duration-200 ease-snappy hover:translate-x-1 hover:bg-terminal-orange hover:py-3 hover:pl-6 hover:text-white sm:text-5xl md:text-7xl"
              >
                {t("navInitiatives")}
                <ArrowRight className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 md:h-9 md:w-9" aria-hidden />
              </Link>
            </li>
            <li>
              <Link
                href="/info"
                className="group flex min-h-[44px] items-center gap-3 font-sans text-4xl font-bold tracking-tighter text-foreground transition-all duration-200 ease-snappy hover:translate-x-1 hover:bg-foreground hover:py-3 hover:pl-6 hover:text-background sm:text-5xl md:text-7xl"
              >
                {t("navInfo")}
                <ArrowRight className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 md:h-9 md:w-9" aria-hidden />
              </Link>
            </li>
          </ul>
        </motion.nav>
      </div>
    </main>
  );
}
