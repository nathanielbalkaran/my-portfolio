"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/SiteHeader";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import {
  ScrollReveal,
  ScrollBorderStrike,
  staggerListVariants,
  staggerItemVariants,
} from "@/components/ScrollReveal";

const snappy = {
  type: "tween" as const,
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};
const stagger = 0.05;

type Project = {
  title: string;
  categoryKey: string;
  year: number;
  url: string;
  image: string;
  aspectClass?: string;
};

const projects: Project[] = [
  {
    title: "Project WhyFi",
    categoryKey: "categoryNonProfit",
    year: 2025,
    url: "https://www.instagram.com/projectwhyfi/",
    image: "/whyfi.jpeg",
    aspectClass: "aspect-square",
  },
  {
    title: "Flammarion's Facebook Page",
    categoryKey: "categoryVideo",
    year: 2024,
    url: "https://youtu.be/cCtyMYjNoLA?si=ygYkUz6HOm28gLUl",
    image: "/flammarion.jpeg",
  },
  {
    title: "UGC Creator",
    categoryKey: "categorySocialMedia",
    year: 2026,
    url: "https://www.instagram.com/nathanielpredicts/",
    image: "/Instagram.jpeg",
    aspectClass: "aspect-[1/2]",
  },
  {
    title: "The Student Who's Teaching Canada's Youth About Money",
    categoryKey: "categoryPublication",
    year: 2025,
    url: "https://www.embark.ca/learning-centre/project-whyfi-student-financial-literacy-embark-resp",
    image: "/embark.jpeg",
  },
  {
    title: "I've Got a Sequence for That",
    categoryKey: "categoryFinancialMathMusicVideo",
    year: 2024,
    url: "https://youtu.be/qw5WNtMp0kY?si=Z09zUxfdRQty3hfr",
    image: "/sequence.jpeg",
  },
  {
    title: "vote nathaniel",
    categoryKey: "categoryCampaign",
    year: 2024,
    url: "https://www.instagram.com/vote4nathaniel/",
    image: "/votenathaniel.jpeg",
    aspectClass: "aspect-square",
  },
];

function sortProjectsByYearNewestFirst<T extends { year: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.year - a.year);
}

export function InitiativesPageClient() {
  const t = useTranslations("initiatives");
  const sortedProjects = sortProjectsByYearNewestFirst(projects);

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader activeLink="initiatives" />

      <div className="page-wrapper mx-auto max-w-6xl">
        <header className="text-left">
          <ScrollReveal>
            <h1
              id="initiatives-page-heading"
              className="font-sans text-4xl font-bold tracking-tighter uppercase leading-tight text-foreground sm:text-7xl md:text-8xl sm:leading-none transition-colors duration-200 hover:text-[#ff7518]"
            >
              <TypewriterTitle
                namespace="initiatives"
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

        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerListVariants(stagger * 2)}
          aria-labelledby="initiatives-page-heading"
        >
          {sortedProjects.map((project) => (
            <motion.a
              key={`${project.url}-${project.title}`}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 break-inside-avoid group block origin-center transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
              variants={staggerItemVariants}
              transition={snappy}
              aria-label={`${project.title} – ${t(project.categoryKey)} (${project.year})`}
            >
              <div className="overflow-hidden">
                <div
                  className={`relative w-full ${
                    project.aspectClass ?? "aspect-[3/2]"
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover rounded-none border border-gray-700 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              </div>
              <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-foreground">
                {project.title}
              </h2>
              <p className="font-mono text-xs text-gray-500 uppercase mt-1">
                {t(project.categoryKey)} · {project.year}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

