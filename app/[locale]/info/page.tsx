"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FlyIn } from "@/components/FlyIn";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import { ExperienceEntries } from "@/components/ExperienceEntries";
import { ScrollReveal, ScrollBorderStrike } from "@/components/ScrollReveal";
import { EXPERIENCE_LINKEDIN_HREF } from "@/data/experience";

const stagger = 0.05;

const linkedInHref = EXPERIENCE_LINKEDIN_HREF;
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
  const t = useTranslations("info");

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
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip font-sans text-foreground antialiased">
      <FlyIn delay={0}>
        <div className="relative z-10 mx-auto w-full min-w-0 max-w-5xl pb-14">
          <header className="text-left">
            <ScrollReveal>
              <h1 className="max-w-full break-words font-sans text-4xl font-bold uppercase leading-tight tracking-tighter text-foreground sm:text-7xl sm:leading-none md:text-8xl">
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
                <ExperienceEntries
                  variant="info"
                  linkedInHint={t("viewLinkedIn")}
                />
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
