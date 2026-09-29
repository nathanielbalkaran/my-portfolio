export type ExperienceItem = {
  company: string;
  role: string;
  year: string;
  logoSrc: string;
  logoBg: string;
};

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    company: "180 Degrees Consulting",
    role: "Consulting Analyst",
    year: "2023 – Present",
    logoSrc: "/logos/180dc.png",
    logoBg: "bg-black",
  },
  {
    company: "Blue Canoe Brands",
    role: "Founder",
    year: "2023 – Present",
    logoSrc: "/logos/blue-canoe-brands.png",
    logoBg: "bg-blue-500",
  },
  {
    company: "Project WhyFi",
    role: "President",
    year: "2023 – Present",
    logoSrc: "/logos/project-whyfi.png",
    logoBg: "bg-blue-500",
  },
  {
    company: "City of Markham",
    role: "Aquatics Supervisor",
    year: "2023 – 2025",
    logoSrc: "/logos/city-of-markham.png",
    logoBg: "bg-blue-500",
  },
];

export const EXPERIENCE_LINKEDIN_HREF =
  "https://www.linkedin.com/in/nathanielbalkaran";
