export const siteContent = {
  common: {
    siteName: "Nathaniel Balkaran",
    collection: "Collection",
    lab: "Lab",
  },
  about: {
    title: "ABOUT",
    subtitle: "Personal dossier and professional experience.",
    experience: "EXPERIENCE",
    viewLinkedIn: "View my full experience on LinkedIn",
    portraitAlt: "Nathaniel Balkaran",
  },
  lab: {
    title: "LAB",
    titleObfuscated: "#@!%*",
    subtitle: "Placeholder for future experiments, tools, and games.",
  },
  footer: {
    email: "nbalkar2@uwo.ca",
    linkedin: "LinkedIn",
    strava: "Strava",
  },
} as const;

/** Homepage professional content: [role, organisation, date] per entry. */
export const professionalSections = [
  {
    label: "EXPERIENCE",
    entries: [
      ["Fall Analyst", "Next Runner Capital", "Sep 2026 — Present"],
      ["Summer Associate", "Salus Brands, LLC", "Apr 2026 — Aug 2026"],
    ],
  },
  {
    label: "EDUCATION",
    entries: [["Western University", "Accounting", "2025 — 2029"]],
  },
  {
    label: "LEADERSHIP",
    entries: [
      ["Director, Events", "Western Real Estate Club", "Sep 2026 — Present"],
      ["Project Lead", "180 Degrees Consulting", "Oct 2025 — Present"],
    ],
  },
] as const;

export const externalLinks = {
  linkedIn: "https://www.linkedin.com/in/nathanielbalkaran",
  strava: "https://www.strava.com/athletes/85417714",
  email: "mailto:nbalkar2@uwo.ca",
  western: "https://www.uwo.ca",
  ivey: "https://www.ivey.uwo.ca/hba/aeo/",
  investing: "https://link.blossomsocial.com/7uYa/psoeg7cc",
  nathanielpredicts: "https://www.instagram.com/nathanielpredicts",
  embark: "https://www.embark.ca/embark-student-foundation",
  github: "https://github.com/nathanielbalkaran",
} as const;
