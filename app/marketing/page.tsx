"use client";

import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";

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
    span: "col-span-1 row-span-2",
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
    <div className="min-h-screen bg-[#fafafa] font-sans font-semibold antialiased">
      <SiteHeader activeLink="marketing" />

      <div className="p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {sortedProjects.map((project) => (
              <motion.a
                key={project.url}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ${project.span}`}
                whileHover={{ scale: 0.98, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Open in new tab indicator — visible on hover */}
                <div
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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
                    className="text-gray-900"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                {/* Image / color block — no text overlay */}
                <div
                  className={`relative min-h-0 flex-1 ${!project.image ? project.color : ""}`}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                {/* Text block below — solid light background */}
                <div className="border-t border-gray-100 bg-white px-5 py-4">
                  <h2 className="text-lg font-bold leading-tight text-gray-900 md:text-xl">
                    {project.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {project.tags.join(" • ")}
                    {project.year != null ? ` • ${project.year}` : ""}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
