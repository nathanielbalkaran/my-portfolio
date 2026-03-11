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
  useTransform,
} from "framer-motion";

type HoverState = "marketing" | "finance" | null;

const transition = { type: "tween", duration: 0.35, ease: "easeOut" } as const;

const CROSSHAIR_DEFAULT = "#E5E7EB";
const CROSSHAIR_MARKETING = "#F97316";
const CROSSHAIR_FINANCE = "#10B981";

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
  const tooltipX = useTransform(springX, (v) => v + 18);
  const tooltipY = useTransform(springY, (v) => v + 18);

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

  return (
    <motion.main
      className="relative flex min-h-screen flex-col"
      transition={transition}
    >
      {/* Background wash on hover (portaled to body so it's not constrained by transforms) */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <motion.div
              className="pointer-events-none fixed inset-0 z-[2]"
              animate={{
                opacity: hovered === null ? 0 : 1,
                backgroundColor:
                  hovered === "marketing"
                    ? "rgba(249, 115, 22, 0.14)"
                    : hovered === "finance"
                      ? "rgba(16, 185, 129, 0.14)"
                      : "rgba(0, 0, 0, 0)",
              }}
              transition={transition}
              aria-hidden
            />,
            document.body
          )
        : null}
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
                    className="fixed z-50 w-[320px] overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-xl ring-1 ring-foreground/10 dark:bg-foreground/5"
                    style={{ left: tooltipX, top: tooltipY }}
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
            <motion.h2
              className="font-sans text-sm font-medium tracking-tighter text-finance-navy/60 sm:text-sm"
              whileHover={{ scale: 3 }}
              whileFocus={{ scale: 3 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              how can i help?
            </motion.h2>
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
                  className="relative z-10 font-sans select-none text-4xl font-semibold tracking-normal sm:text-5xl md:text-6xl lg:text-7xl"
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
                  className="relative z-10 select-none text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
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

    </motion.main>
  );
}
