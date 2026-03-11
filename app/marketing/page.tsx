"use client";

import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { FlyIn } from "@/components/FlyIn";

type Project = {
  title: string;
  tags: string[];
  url: string;
  color: string;
  span: string;
  image?: string;
  year?: number;
};

const projects: Project[] = [
  {
    title: "Project WhyFi",
    tags: ["Non-Profit", "Instagram", "Campaign"],
    url: "https://www.instagram.com/projectwhyfi/",
    color: "bg-blue-500",
    span: "col-span-2 row-span-2",
    image: "/whyfi.jpeg",
    year: 2025,
  },
  {
    title: "Flammarion's Facebook Page",
    tags: ["YouTube", "Video Editing"],
    url: "https://youtu.be/cCtyMYjNoLA?si=ygYkUz6HOm28gLUl",
    color: "bg-pink-500",
    span: "col-span-1 row-span-1",
    image: "/flammarion.jpeg",
    year: 2024,
  },
  {
    title: "UGC Creator",
    tags: ["Instagram", "TikTok", "Video"],
    url: "https://www.instagram.com/nathanielpredicts/",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    span: "col-span-1 row-span-3",
    image: "/Instagram.jpeg",
    year: 2026,
  },
  {
    title: "Embark Article",
    tags: ["Publication", "Non-Profit"],
    url: "https://www.embark.ca/learning-centre/project-whyfi-student-financial-literacy-embark-resp",
    color: "bg-slate-100 text-slate-800",
    span: "col-span-1 row-span-1",
    image: "/embark.jpeg",
    year: 2025,
  },
  {
    title: "But, We Had Plans",
    tags: ["Youtube", "Acting", "Video Editing"],
    url: "https://youtu.be/qw5WNtMp0kY?si=Z09zUxfdRQty3hfr",
    color: "bg-slate-100 text-slate-800",
    span: "col-span-1 row-span-1",
    image: "/plans.jpeg",
    year: 2025,
  },
  {
    title: "I've Got a Sequence for That",
    tags: ["Youtube", "Music Video", "Video Editing"],
    url: "https://youtu.be/qw5WNtMp0kY?si=Z09zUxfdRQty3hfr",
    color: "bg-slate-100 text-slate-800",
    span: "col-span-1 row-span-1",
    image: "/sequence.jpeg",
    year: 2024,
  },
  {
    title: "vote nathaniel",
    tags: ["Instagram", "Campaign"],
    url: "https://www.instagram.com/vote4nathaniel/",
    color: "bg-slate-100 text-slate-800",
    span: "col-span-1 row-span-1",
    image: "/votenathaniel.jpeg",
    year: 2024,
  },
];

function sortProjectsByYearNewestFirst(projectsList: Project[]): Project[] {
  return [...projectsList].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export default function MarketingPage() {
  const sortedProjects = sortProjectsByYearNewestFirst(projects);

  return (
    <div className="min-h-screen bg-background font-sans font-semibold text-finance-navy antialiased">
      <FlyIn delay={0}>
        <SiteHeader activeLink="marketing" />
      </FlyIn>

      <div className="p-6 pb-24 md:p-8 md:pb-28 lg:p-10 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <FlyIn delay={0.06}>
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-finance-navy sm:text-4xl">
              Projects
            </h1>
            <p className="mt-2 font-sans text-base leading-relaxed text-finance-navy/70">
              My miscellaneous marketing projects and campaigns.
            </p>
          </FlyIn>
          <div className="mt-10 grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 [&>*]:min-h-0 [&>*]:overflow-hidden">
            {sortedProjects.map((project, index) => (
              <FlyIn
                key={`${project.url}-${project.title}-${index}`}
                delay={0.1 + index * 0.05}
                className={project.span}
              >
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-foreground/10 dark:bg-foreground/5"
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Open in new tab indicator — visible on hover */}
                <div
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-md opacity-0 ring-1 ring-foreground/10 transition-opacity duration-200 group-hover:opacity-100 dark:bg-foreground/10"
                  aria-hidden
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                {/* Image / color block — scales down on hover, keeps rounded corners */}
                <div
                  className={`relative min-h-0 flex-1 overflow-hidden rounded-t-xl ${!project.image ? project.color : ""}`}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full rounded-t-xl object-cover transition-transform duration-300 ease-out hover:scale-95"
                    />
                  ) : null}
                </div>
                {/* Text block — scales up on card hover */}
                <div className="origin-bottom border-t border-foreground/10 bg-background px-5 py-4 text-foreground transition-transform duration-300 ease-out group-hover:scale-[1.03] dark:bg-transparent">
                  <h2 className="font-sans text-lg font-bold leading-tight md:text-xl">
                    {project.title}
                  </h2>
                  <p className="mt-1 font-sans text-sm font-medium text-foreground/60">
                    {project.tags.join(" • ")}
                    {project.year != null ? ` • ${project.year}` : ""}
                  </p>
                </div>
              </motion.a>
              </FlyIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
