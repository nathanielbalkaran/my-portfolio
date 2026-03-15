"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/SiteHeader";
import { TypewriterTitle } from "@/components/TypewriterTitle";

const snappy = { type: "tween" as const, duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };
const stagger = 0.05;

type Project = {
  title: string;
  categoryKey: string;
  year: number;
  url: string;
  image: string;
};

const projects: Project[] = [
  { title: "Project WhyFi", categoryKey: "categoryNonProfit", year: 2025, url: "https://www.instagram.com/projectwhyfi/", image: "/whyfi.jpeg" },
  { title: "Flammarion's Facebook Page", categoryKey: "categoryVideo", year: 2024, url: "https://youtu.be/cCtyMYjNoLA?si=ygYkUz6HOm28gLUl", image: "/flammarion.jpeg" },
  { title: "UGC Creator", categoryKey: "categorySocialMedia", year: 2026, url: "https://www.instagram.com/nathanielpredicts/", image: "/Instagram.jpeg" },
  { title: "Embark Article", categoryKey: "categoryPublication", year: 2025, url: "https://www.embark.ca/learning-centre/project-whyfi-student-financial-literacy-embark-resp", image: "/embark.jpeg" },
  { title: "I've Got a Sequence for That", categoryKey: "categoryMusicVideo", year: 2024, url: "https://youtu.be/qw5WNtMp0kY?si=Z09zUxfdRQty3hfr", image: "/sequence.jpeg" },
  { title: "vote nathaniel", categoryKey: "categoryCampaign", year: 2024, url: "https://www.instagram.com/vote4nathaniel/", image: "/votenathaniel.jpeg" },
];

function sortProjectsByYearNewestFirst<T extends { year: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.year - a.year);
}

export default function InitiativesPage() {
  const t = useTranslations("initiatives");
  const sortedProjects = sortProjectsByYearNewestFirst(projects);

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader activeLink="initiatives" />

      <div className="page-wrapper mx-auto max-w-6xl">
        <header className="text-left">
          <motion.h1
            className="font-sans text-7xl font-bold tracking-tighter uppercase leading-none text-foreground md:text-8xl transition-colors duration-200 hover:text-[#ff7518]"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0 }}
          >
            <TypewriterTitle
              namespace="initiatives"
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

        <motion.div
          className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: stagger * 2 } } }}
        >
          {sortedProjects.map((project) => (
            <motion.a
              key={`${project.url}-${project.title}`}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
              variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
              transition={snappy}
            >
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt=""
                  className="w-full aspect-video object-cover rounded-none border border-gray-700 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-foreground">
                {project.title}
              </h2>
              <p className="font-mono text-xs text-gray-500 uppercase mt-1">
                {t(project.categoryKey)} // {project.year}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
