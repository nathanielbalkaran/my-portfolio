"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { FlyIn } from "@/components/FlyIn";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

type HoverState = "marketing" | "finance" | null;

const transition = { type: "tween", duration: 0.35, ease: "easeOut" } as const;

const CROSSHAIR_DEFAULT = "#E5E7EB";
const CROSSHAIR_MARKETING = "#F97316";
const CROSSHAIR_FINANCE = "#10B981";

const DOT_DEFAULT = "rgba(0, 0, 0, 0.12)";
const DOT_MARKETING = "rgba(249, 115, 22, 0.25)";
const DOT_FINANCE = "rgba(16, 185, 129, 0.25)";

export default function Page() {
  const [hovered, setHovered] = useState<HoverState>(null);
  const [mounted, setMounted] = useState(false);
  const [showAboutPreview, setShowAboutPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  const crosshairColor =
    hovered === "marketing"
      ? CROSSHAIR_MARKETING
      : hovered === "finance"
        ? CROSSHAIR_FINANCE
        : CROSSHAIR_DEFAULT;

  const marketingScale = hovered === "marketing" ? 1.08 : 1;
  const financeScale = hovered === "finance" ? 1.08 : 1;

  const dotGrid = (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${DOT_DEFAULT} 1px, transparent 1px)`,
          backgroundSize: "1in 1in",
        }}
        animate={{ opacity: hovered === null ? 1 : 0 }}
        transition={transition}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${DOT_MARKETING} 1px, transparent 1px)`,
          backgroundSize: "1in 1in",
        }}
        animate={{ opacity: hovered === "marketing" ? 1 : 0 }}
        transition={transition}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${DOT_FINANCE} 1px, transparent 1px)`,
          backgroundSize: "1in 1in",
        }}
        animate={{ opacity: hovered === "finance" ? 1 : 0 }}
        transition={transition}
      />
    </div>
  );

  return (
    <motion.main
      className="relative flex min-h-screen flex-col"
      transition={transition}
    >
      {/* Dot grid portaled to body so it sits behind layout's z-10 wrapper (not covered by it) */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(dotGrid, document.body)}
      {/* Crosshairs: vertical and horizontal lines (z-50 so above dot grid and content) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-50 h-screen w-px -translate-x-px"
        style={{ left: springX }}
        animate={{ backgroundColor: crosshairColor }}
        transition={transition}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-50 h-px w-screen -translate-y-px"
        style={{ top: springY }}
        animate={{ backgroundColor: crosshairColor }}
        transition={transition}
      />

      <FlyIn delay={0}>
        <header className="relative z-10">
          <SiteHeader activeLink="home" />
        </header>
      </FlyIn>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-4xl flex-col items-center">
          <FlyIn delay={0.08}>
            <h1 className="mb-6 text-4xl font-medium tracking-tight text-finance-navy sm:text-5xl md:text-6xl">
            <span className="font-sans">hi, i&apos;m </span>
            <Link
              href="/about"
              className="relative inline-block"
              onMouseEnter={() => setShowAboutPreview(true)}
              onMouseLeave={() => setShowAboutPreview(false)}
            >
              <span
                className="font-serif transition-colors hover:text-finance-navy/80"
                style={{ fontFamily: "var(--font-heading-serif)" }}
              >
                Nathaniel
              </span>
              <AnimatePresence>
                {showAboutPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-[320px] -translate-x-1/2 overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-xl ring-1 ring-foreground/10 dark:bg-foreground/5"
                  >
                    <div className="p-4">
                      <h2 className="mb-2 text-lg font-bold tracking-tight text-foreground">
                        About me
                      </h2>
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src="/profile.jpg"
                            alt="Nathaniel"
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <p className="line-clamp-3 text-sm text-foreground/70">
                          First-year business student at Western University with
                          Ivey AEO Status. Passionate about investing and
                          understanding how markets operate.
                        </p>
                      </div>
                      <p className="mt-2 text-xs font-medium text-emerald">
                        Click to view full page →
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </h1>
          </FlyIn>
          <FlyIn delay={0.14}>
            <h2 className="font-sans text-sm font-medium tracking-tighter text-finance-navy/60 sm:text-sm">
              how can i help?
            </h2>
          </FlyIn>
          <FlyIn delay={0.2}>
          <div className="mt-8 flex w-full max-w-3xl items-stretch justify-between gap-8">
            <Link href="/marketing" className="flex flex-1 items-center justify-center px-4">
            <motion.span
              className="block w-full text-center"
              onMouseEnter={() => setHovered("marketing")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("marketing")}
              onBlur={() => setHovered(null)}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative inline-block py-1">
                <motion.div
                  className="absolute inset-0 rounded-sm bg-[#F97316]"
                  style={{
                    rotate: -1.5,
                    transformOrigin: "left",
                  }}
                  animate={{
                    scaleX: hovered === "marketing" ? 1 : 0,
                  }}
                  transition={transition}
                />
                <motion.span
                  className="relative z-10 font-sans select-none text-3xl font-semibold tracking-normal sm:text-4xl md:text-5xl"
                  animate={{
                    scale: marketingScale,
                    color:
                      hovered === "marketing"
                        ? "rgba(250, 250, 250, 1)"
                        : "var(--finance-navy)",
                  }}
                  transition={transition}
                >
                  Marketing
                </motion.span>
              </span>
            </motion.span>
            </Link>

            <Link href="/finance" className="flex flex-1 items-center justify-center px-4">
              <motion.span
                className="relative inline-block py-1"
                onMouseEnter={() => setHovered("finance")}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered("finance")}
                onBlur={() => setHovered(null)}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-none bg-[#10B981]"
                  animate={{
                    opacity: hovered === "finance" ? 1 : 0,
                  }}
                  transition={transition}
                />
                <motion.span
                  style={{ fontFamily: "var(--font-heading-serif)" }}
                  className="relative z-10 select-none text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
                  animate={{
                    scale: financeScale,
                    color:
                      hovered === "finance"
                        ? "rgba(250, 250, 250, 1)"
                        : "var(--finance-navy)",
                  }}
                  transition={transition}
                >
                  Finance
                </motion.span>
              </motion.span>
            </Link>
          </div>
          </FlyIn>
        </div>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 px-4 py-2 text-[10px] text-gray-400 sm:text-xs">
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-xl">
            Disclaimer: Content is for educational purposes only and does not
            constitute professional investment advice.
          </p>
          <div className="flex shrink-0 gap-3 text-[10px] sm:text-xs">
            <a
              href="/resume"
              className="transition-colors hover:text-emerald"
            >
              Resume
            </a>
            <a
              href="mailto:hello@example.com"
              className="transition-colors hover:text-emerald"
            >
              Email
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-emerald"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}
