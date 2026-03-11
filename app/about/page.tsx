"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { FlyIn } from "@/components/FlyIn";

function CanvasLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getIsDark = () => document.documentElement.classList.contains("dark");
    const getBaseFill = () =>
      getIsDark() ? "rgba(7, 11, 20, 1)" : "rgba(255, 255, 255, 1)";
    const getFadeFill = () =>
      getIsDark() ? "rgba(7, 11, 20, 0.12)" : "rgba(255, 255, 255, 0.1)";

    const dpr = Math.max(2, window.devicePixelRatio || 2);

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep the canvas background aligned with the page.
      ctx.fillStyle = getBaseFill();
      ctx.fillRect(0, 0, w, h);
    };

    ctx.strokeStyle = "#10B981";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#10B981";

    resize();

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const last = lastPointRef.current;
      if (!last) {
        lastPointRef.current = { x, y };
        return;
      }

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPointRef.current = { x, y };
    };

    const onMouseLeave = () => {
      lastPointRef.current = null;
    };

    const tick = () => {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.fillStyle = getFadeFill();
      ctx.fillRect(0, 0, w, h);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("storage", resize);
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("storage", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}

const experience = [
  {
    company: "Polymarket",
    role: "UGC Creator",
    date: "2025 - Present",
    logoBg: "bg-blue-600",
    logoSrc: "/logos/polymarket.png",
  },
  {
    company: "180 Degrees Consulting",
    role: "Consulting Analyst",
    date: "2023 - Present",
    logoBg: "bg-black",
    logoSrc: "/logos/180dc.png",
  },
  {
    company: "Blue Canoe Brands",
    role: "Founder",
    date: "2023 - Present",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/blue-canoe-brands.png",
  },
  {
    company: "Project WhyFi",
    role: "Founder",
    date: "2023 - Present",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/project-whyfi.png",
  },
  {
    company: "City of Markham",
    role: "Aquatics Supervisor",
    date: "2023 - 2025",
    logoBg: "bg-blue-500",
    logoSrc: "/logos/city-of-markham.png",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans font-semibold text-finance-navy antialiased">
      <CanvasLayer />
      <FlyIn delay={0}>
        <div className="relative z-20">
          <SiteHeader activeLink="about" />
        </div>
      </FlyIn>

      {/* Two-column layout */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 p-8 md:grid-cols-2 md:p-16">
          {/* Left column: text & experience */}
          <FlyIn delay={0.08} className="flex flex-col">
            <h1 className="mb-8 !font-serif text-4xl font-bold tracking-tight text-finance-navy md:text-5xl lg:text-6xl">
              About me
            </h1>

            <div className="space-y-5 font-sans text-lg text-finance-navy/80">
              <p>
                I am a first-year business student at{" "}
                <Link
                  href="https://www.uwo.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  Western University
                </Link>{" "}
                with{" "}
                <Link
                  href="https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  Ivey AEO Status
                </Link>
                . I am passionate about {" "}
                <Link
                  href="https://link.blossomsocial.com/7uYa/u3jedbg1"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  investing
                </Link>{" "}
                 and understanding how markets
                operate.
              </p>
              <p>
                When I&apos;m not studying, I&apos;m working on social media
                content{" "}
                <Link
                  href="https://www.instagram.com/nathanielpredicts/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  @nathanielpredicts
                </Link>{" "}
                or spending time outdoors{" "}
                <Link
                  href="https://www.strava.com/athletes/85417714"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  running, biking, or hiking. 
                </Link>
                  {" "}I also love to snowboard and slalom waterski.
              </p>
              <p>
                I take pride in my work and am always looking for new problems
                to solve. {" "}
                <Link
                  href="mailto:nbalkar2@uwo.ca"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#FF7A00] underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/60"
                >
                  Lets connect!
                </Link>
              </p>
            </div>

            <h2 className="mt-10 mb-4 text-sm font-bold uppercase tracking-wider text-finance-navy/60">
              Experience
            </h2>
            <ul className="space-y-5">
              {experience.map((item) => (
                <li
                  key={item.company}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div
                      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full ${item.logoBg}`}
                    >
                      {item.logoSrc ? (
                        <Image
                          src={item.logoSrc}
                          alt={`${item.company} logo`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                          {item.company
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase())
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-finance-navy">
                        {item.company}
                      </p>
                      <p className="text-sm text-finance-navy/60">{item.role}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm text-finance-navy/60">
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          </FlyIn>

          {/* Right column: hero image */}
          <FlyIn delay={0.14} className="relative h-[600px] w-full overflow-hidden rounded-2xl">
            <Image
              src="/profile.jpg"
              alt="Nathaniel Balkaran"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </FlyIn>
        </div>
      </div>
    </div>
  );
}
