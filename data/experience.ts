export type ExperienceItem = {
  company: string;
  roleKey: string;
  yearKey: string;
  logoSrc: string;
  /** Background behind logo (info layout only). */
  logoBg: string;
};

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    company: "180 Degrees Consulting",
    roleKey: "180dcRole",
    yearKey: "180dcYear",
    logoSrc: "/logos/180dc.png",
    logoBg: "bg-black",
  },
  {
    company: "Blue Canoe Brands",
    roleKey: "blueCanoeRole",
    yearKey: "blueCanoeYear",
    logoSrc: "/logos/blue-canoe-brands.png",
    logoBg: "bg-blue-500",
  },
  {
    company: "Project WhyFi",
    roleKey: "whyfiRole",
    yearKey: "whyfiYear",
    logoSrc: "/logos/project-whyfi.png",
    logoBg: "bg-blue-500",
  },
  {
    company: "City of Markham",
    roleKey: "markhamRole",
    yearKey: "markhamYear",
    logoSrc: "/logos/city-of-markham.png",
    logoBg: "bg-blue-500",
  },
];

export const EXPERIENCE_LINKEDIN_HREF =
  "https://www.linkedin.com/in/nathanielbalkaran";
