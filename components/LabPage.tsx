"use client";

import { ScrollReveal, ScrollBorderStrike } from "@/components/ScrollReveal";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import { siteContent } from "@/data/site-content";

const lab = siteContent.lab;

export function LabPage() {
  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip font-sans text-foreground antialiased">
      <div className="page-wrapper">
        <div className="w-full min-w-0 max-w-5xl pb-14">
          <header className="text-left">
            <ScrollReveal>
              <h1 className="max-w-full break-words font-sans text-4xl font-bold uppercase leading-tight tracking-tighter text-foreground sm:text-7xl sm:leading-none md:text-8xl">
                <TypewriterTitle
                  text={lab.title}
                  obfuscatedText={lab.titleObfuscated}
                />
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <p className="font-mono text-sm text-gray-400 tracking-tight pb-8">
                {lab.subtitle}
              </p>
            </ScrollReveal>
            <ScrollBorderStrike className="mb-12" />
          </header>
        </div>
      </div>
    </div>
  );
}
