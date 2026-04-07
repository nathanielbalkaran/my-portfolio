"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  staggerItemVariants,
  staggerListVariants,
} from "@/components/ScrollReveal";
import {
  EXPERIENCE_ITEMS,
  EXPERIENCE_LINKEDIN_HREF,
} from "@/data/experience";

type Variant = "home" | "info";

export function ExperienceEntries({
  variant,
  linkedInHint,
}: {
  variant: Variant;
  /** Shown in floating hint on hover (info variant only). */
  linkedInHint?: string;
}) {
  const tExp = useTranslations("homeExperience");
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      {variant === "info" && hover && linkedInHint ? (
        <div
          className="pointer-events-none fixed left-0 top-0 z-40 -translate-x-1/2 border border-foreground/15 bg-background/95 px-3 py-2 backdrop-blur"
          style={{
            transform: `translate(${hover.x}px, ${hover.y - 20}px) translate(-50%, -100%)`,
          }}
          aria-hidden
        >
          <div className="text-[11px] font-medium text-foreground/80">
            {linkedInHint}
          </div>
        </div>
      ) : null}

      <motion.ul
        className={variant === "home" ? "space-y-0.5" : "space-y-1"}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerListVariants(0.1)}
      >
        {EXPERIENCE_ITEMS.map((item) => (
          <motion.li
            key={`${item.company}-${item.yearKey}`}
            variants={staggerItemVariants}
          >
            {variant === "home" ? (
              <a
                href={EXPERIENCE_LINKEDIN_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="group/exp flex min-h-[44px] flex-wrap items-center gap-x-2 gap-y-0 rounded-none py-2 pr-2 -mr-2 transition-colors duration-200 hover:bg-foreground/10"
                aria-label={`${item.company} – ${tExp(item.roleKey)} (${tExp(item.yearKey)}) on LinkedIn`}
              >
                <span className="relative h-6 w-6 shrink-0 overflow-hidden">
                  <Image
                    src={item.logoSrc}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="24px"
                    priority
                  />
                </span>
                <span className="font-sans font-bold text-foreground group-hover/exp:text-foreground">
                  {item.company}
                </span>
                <span className="text-gray-500">·</span>
                <span className="font-sans text-foreground/80 group-hover/exp:text-foreground/90">
                  {tExp(item.roleKey)}
                </span>
                <span className="text-gray-500">·</span>
                <span className="font-mono text-sm text-gray-500 group-hover/exp:text-gray-400">
                  {tExp(item.yearKey)}
                </span>
              </a>
            ) : (
              <a
                href={EXPERIENCE_LINKEDIN_HREF}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center rounded-none px-4 py-3 font-sans text-sm text-foreground/90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-100 hover:text-black dark:hover:bg-[#1E2D4A] dark:hover:text-white"
                onMouseEnter={(e) =>
                  setHover({ x: e.clientX, y: e.clientY })
                }
                onMouseMove={(e) =>
                  setHover({ x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setHover(null)}
              >
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

                <div className="mx-3 hidden items-center text-gray-500 md:flex">
                  <span className="mx-2 text-foreground/40" aria-hidden>
                    •
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    {tExp(item.roleKey)}
                  </span>
                </div>

                <div className="ml-3 flex shrink-0 items-center">
                  <span className="mx-2 text-foreground/40" aria-hidden>
                    •
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    {tExp(item.yearKey)}
                  </span>
                </div>
              </a>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </>
  );
}
