"use client";

import Image from "next/image";
import { FlyIn } from "@/components/FlyIn";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import { Experience } from "@/components/Experience";
import { AboutBio } from "@/components/AboutBio";
import { Header } from "@/components/Header";
import { ScrollReveal, ScrollBorderStrike } from "@/components/ScrollReveal";
import { siteContent } from "@/data/site-content";

const stagger = 0.05;
const about = siteContent.about;

export function AboutPage() {
  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip font-sans text-foreground antialiased">
      <Header activeLink="about" />
      <div className="page-wrapper">
        <FlyIn delay={0}>
          <div className="relative z-10 mx-auto w-full min-w-0 max-w-5xl pb-14">
            <header className="text-left">
              <ScrollReveal>
                <h1 className="max-w-full break-words font-sans text-4xl font-bold uppercase leading-tight tracking-tighter text-foreground sm:text-7xl sm:leading-none md:text-8xl">
                  <TypewriterTitle
                    text={about.title}
                    obfuscatedText={about.titleObfuscated}
                  />
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={stagger}>
                <p className="font-mono text-sm text-gray-400 tracking-tight pb-8">
                  {about.subtitle}
                </p>
              </ScrollReveal>
              <ScrollBorderStrike className="mb-12" />
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              <div className="order-2 lg:order-none lg:col-span-7 space-y-10">
                <FlyIn delay={0.06}>
                  <AboutBio />
                </FlyIn>

                <FlyIn delay={0.1} className="mt-10">
                  <ScrollReveal>
                    <h2 className="mb-6 font-sans text-sm font-medium uppercase tracking-wide text-foreground/60">
                      {about.experience}
                    </h2>
                  </ScrollReveal>
                  <Experience
                    variant="about"
                    linkedInHint={about.viewLinkedIn}
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
                    alt={about.portraitAlt}
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
    </div>
  );
}
