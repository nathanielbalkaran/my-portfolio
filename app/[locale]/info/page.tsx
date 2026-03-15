"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FlyIn } from "@/components/FlyIn";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import {
  ScrollReveal,
  ScrollBorderStrike,
  staggerListVariants,
  staggerItemVariants,
} from "@/components/ScrollReveal";

const stagger = 0.05;

const experience = [
  {
    company: "Polymarket",
    roleKey: "polymarketRole",
    dateKey: "polymarketYear",
    logoBg: "bg-blue-600",
    logoSrc: "/logos/polymarket.png",
  },
  {
    company: "180 Degrees Consulting",
    roleKey: "180dcRole",
    dateKey: "180dcYear",
    logoBg: "bg-black",
    logoSrc: "/logos/180dc.png",
  },
  {
    company: "Blue Canoe Brands",
    roleKey: "blueCanoeRole",
    dateKey: "blueCanoeYear",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/blue-canoe-brands.png",
  },
  {
    company: "Project WhyFi",
    roleKey: "whyfiRole",
    dateKey: "whyfiYear",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/project-whyfi.png",
  },
  {
    company: "City of Markham",
    roleKey: "markhamRole",
    dateKey: "markhamYear",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/city-of-markham.png",
  },
];

const linkedInHref = "https://www.linkedin.com/in/nathanielbalkaran";
const bioLinks = {
  western: "https://www.uwo.ca",
  ivey: "https://www.ivey.uwo.ca/hba/aeo/",
  investing: "https://link.blossomsocial.com/7uYa/psoeg7cc",
  nathanielpredicts: "https://www.instagram.com/nathanielpredicts",
  running: "https://www.strava.com/athletes/85417714",
  biking: "https://www.strava.com/athletes/85417714",
  hiking: "https://www.strava.com/athletes/85417714",
  connect: linkedInHref,
};

const linkClass =
  "text-[#F97316] underline underline-offset-2 decoration-[#F97316]/70 transition-colors ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#F97316] hover:text-black hover:decoration-transparent";

export default function InfoPage() {
  const [experienceHover, setExperienceHover] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const t = useTranslations("info");
  const tExp = useTranslations("homeExperience");

  const bioRichComponents = useMemo(
    () => ({
      western: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.western}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      ivey: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.ivey}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      investing: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.investing}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      nathanielpredicts: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.nathanielpredicts}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      running: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.running}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      biking: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.biking}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      hiking: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.hiking}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
      connect: (chunks: React.ReactNode) => (
        <a
          href={bioLinks.connect}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      ),
    }),
    [],
  );

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <FlyIn delay={0}>
        <div className="relative z-10 w-full max-w-5xl pb-14">
          {experienceHover ? (
            <div
              className="pointer-events-none fixed left-0 top-0 z-40 -translate-x-1/2 border border-foreground/15 bg-background/95 px-3 py-2 backdrop-blur"
              style={{
                transform: `translate(${experienceHover.x}px, ${experienceHover.y - 20}px) translate(-50%, -100%)`,
              }}
              aria-hidden
            >
              <div className="text-[11px] font-medium text-foreground/80">
                {t("viewLinkedIn")}
              </div>
            </div>
          ) : null}

          <header className="text-left">
            <ScrollReveal>
              <h1 className="font-sans text-4xl font-bold tracking-tighter uppercase leading-tight text-foreground sm:text-7xl md:text-8xl sm:leading-none">
                <TypewriterTitle
                  namespace="info"
                  titleKey="title"
                  titleObfuscatedKey="titleObfuscated"
                />
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={stagger}>
              <p className="font-mono text-sm text-gray-400 tracking-tight pb-8">
                {t("subtitle")}
              </p>
            </ScrollReveal>
            <ScrollBorderStrike className="mb-12" />
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left column: Dossier slab text + Experience room */}
            <div className="order-2 lg:order-none lg:col-span-7 space-y-10">
              <FlyIn delay={0.06}>
                <section
                  className="relative max-w-3xl border-l-2 border-[#F97316] pl-6 font-sans text-[15px] font-semibold leading-snug text-foreground/90 hyphens-auto"
                  lang="en"
                >
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <p className="text-justify">
                    {t.rich("bio1", bioRichComponents)}
                  </p>
                  <p className="mt-4 text-justify">
                    {t.rich("bio2", bioRichComponents)}
                  </p>
                  <p className="mt-4 text-justify">
                    {t.rich("bio3", bioRichComponents)}
                  </p>
                </section>
              </FlyIn>

              <FlyIn delay={0.1} className="mt-10">
                <ScrollReveal>
                  <h2 className="mb-6 font-sans text-sm font-medium uppercase tracking-wide text-foreground/60">
                    {t("experience")}
                  </h2>
                </ScrollReveal>
                <motion.ul
                  className="space-y-1"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={staggerListVariants(0.1)}
                >
                  {experience.map((item) => (
                    <motion.li
                      key={item.company}
                      variants={staggerItemVariants}
                    >
                      <a
                        href={linkedInHref}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center rounded-none px-4 py-3 font-sans text-sm text-foreground/90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-100 hover:text-black dark:hover:bg-[#1E2D4A] dark:hover:text-white"
                        onMouseEnter={(e) =>
                          setExperienceHover({ x: e.clientX, y: e.clientY })
                        }
                        onMouseMove={(e) =>
                          setExperienceHover({ x: e.clientX, y: e.clientY })
                        }
                        onMouseLeave={() => setExperienceHover(null)}
                      >
                        {/* Left: Logo + Company */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            className={`relative h-7 w-7 shrink-0 overflow-hidden ${item.logoBg}`}
                          >
                            <Image
                              src={item.logoSrc}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                          <span className="font-sans text-sm font-bold text-foreground dark:text-white">
                            {item.company}
                          </span>
                        </div>

                        {/* Center: Role */}
                        <div className="mx-3 hidden items-center text-gray-500 md:flex">
                          <span className="mx-2 text-foreground/40" aria-hidden>
                            •
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            {tExp(item.roleKey)}
                          </span>
                        </div>

                        {/* Right: Date */}
                        <div className="ml-3 flex shrink-0 items-center">
                          <span className="mx-2 text-foreground/40" aria-hidden>
                            •
                          </span>
                          <span className="font-mono text-xs text-gray-400">
                            {tExp(item.dateKey)}
                          </span>
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
              </FlyIn>
            </div>

            <FlyIn
              delay={0.08}
              className="order-1 mt-8 w-full lg:order-none lg:col-span-5 lg:mt-0 lg:sticky lg:top-20 lg:self-start"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-gray-700 rounded-none">
                <Image
                  src="/profile-portrait.png"
                  alt={t("portraitAlt")}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 41.666vw"
                  priority
                />
              </div>
            </FlyIn>
          </div>
        </div>
      </FlyIn>
    </div>
  );
}
