"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FlyIn } from "@/components/FlyIn";
import { TypewriterTitle } from "@/components/TypewriterTitle";

const snappy = { type: "tween" as const, duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };
const stagger = 0.05;

const experience = [
  { company: "Polymarket", roleKey: "polymarketRole", dateKey: "polymarketYear", logoBg: "bg-blue-600", logoSrc: "/logos/polymarket.png" },
  { company: "180 Degrees Consulting", roleKey: "180dcRole", dateKey: "180dcYear", logoBg: "bg-black", logoSrc: "/logos/180dc.png" },
  { company: "Blue Canoe Brands", roleKey: "blueCanoeRole", dateKey: "blueCanoeYear", logoBg: "bg-blue-500", logoSrc: "/logos/blue-canoe-brands.png" },
  { company: "Project WhyFi", roleKey: "whyfiRole", dateKey: "whyfiYear", logoBg: "bg-blue-500", logoSrc: "/logos/project-whyfi.png" },
  { company: "City of Markham", roleKey: "markhamRole", dateKey: "markhamYear", logoBg: "bg-blue-500", logoSrc: "/logos/city-of-markham.png" },
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
  "text-orange-500 underline underline-offset-2 decoration-orange-500/70 hover:text-orange-400 hover:decoration-orange-400 focus:outline-none focus:text-orange-400 focus:decoration-orange-400 transition-colors";

type HoverPreview = {
  href: string;
  label: string;
  x: number;
  y: number;
};

function getPrettyUrl(href: string) {
  try {
    const url = new URL(href);
    const nicePath =
      url.pathname && url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : "";
    return `${url.hostname}${nicePath}`;
  } catch {
    return href;
  }
}

export default function InfoPage() {
  const [experienceHover, setExperienceHover] = useState<{ x: number; y: number } | null>(null);
  const t = useTranslations("info");
  const tExp = useTranslations("homeExperience");

  const bioRichComponents = useMemo(
    () => ({
      western: (chunks: React.ReactNode) => (
        <a href={bioLinks.western} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      ivey: (chunks: React.ReactNode) => (
        <a href={bioLinks.ivey} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      investing: (chunks: React.ReactNode) => (
        <a href={bioLinks.investing} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      nathanielpredicts: (chunks: React.ReactNode) => (
        <a href={bioLinks.nathanielpredicts} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      running: (chunks: React.ReactNode) => (
        <a href={bioLinks.running} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      biking: (chunks: React.ReactNode) => (
        <a href={bioLinks.biking} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      hiking: (chunks: React.ReactNode) => (
        <a href={bioLinks.hiking} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
      connect: (chunks: React.ReactNode) => (
        <a href={bioLinks.connect} target="_blank" rel="noreferrer" className={linkClass}>
          {chunks}
        </a>
      ),
    }),
    []
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
            <motion.h1
              className="font-sans text-7xl font-bold tracking-tighter uppercase leading-none text-foreground md:text-8xl"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...snappy, delay: 0 }}
            >
              <TypewriterTitle
                namespace="info"
                titleKey="title"
                titleObfuscatedKey="titleObfuscated"
              />
            </motion.h1>
            <motion.p
              className="font-mono text-sm text-gray-400 tracking-tight pb-8"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...snappy, delay: stagger }}
            >
              {t("subtitle")}
            </motion.p>
            <motion.div
              className="origin-left border-b border-gray-700 mb-12"
              aria-hidden
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ ...snappy, delay: stagger }}
            />
          </header>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <FlyIn delay={0.06}>
                <div
                  className="max-w-3xl border-l-2 border-gray-700 pl-6 font-sans text-lg font-semibold leading-[1.4] text-foreground/90 text-justify hyphens-auto"
                >
                  <p>{t.rich("bio1", bioRichComponents)}</p>
                  <p className="mt-4">{t.rich("bio2", bioRichComponents)}</p>
                  <p className="mt-4">{t.rich("bio3", bioRichComponents)}</p>
                </div>
              </FlyIn>

              <FlyIn delay={0.1} className="mt-10">
                <h2 className="mb-6 font-sans text-sm font-medium uppercase tracking-wide text-foreground/60">
                  {t("experience")}
                </h2>
                <ul className="space-y-1">
                  {experience.map((item) => (
                    <li key={item.company}>
                      <a
                        href={linkedInHref}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                        onMouseEnter={(e) =>
                          setExperienceHover({ x: e.clientX, y: e.clientY })
                        }
                        onMouseMove={(e) =>
                          setExperienceHover({ x: e.clientX, y: e.clientY })
                        }
                        onMouseLeave={() => setExperienceHover(null)}
                      >
                        <div
                          className={`relative h-5 w-5 shrink-0 overflow-hidden rounded-sm ${item.logoBg}`}
                        >
                          <Image
                            src={item.logoSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="20px"
                          />
                        </div>
                        <span className="font-sans font-bold text-foreground">
                          {item.company}
                        </span>
                        <span className="text-foreground/50" aria-hidden>•</span>
                        <span className="font-sans text-sm font-normal text-foreground/75">
                          {tExp(item.roleKey)}
                        </span>
                        <span className="text-foreground/50" aria-hidden>•</span>
                        <span className="font-sans text-sm font-normal text-foreground/75">
                          {tExp(item.dateKey)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </FlyIn>
            </div>

            <FlyIn delay={0.08} className="lg:col-span-5 w-full lg:sticky lg:top-24 lg:self-start">
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
