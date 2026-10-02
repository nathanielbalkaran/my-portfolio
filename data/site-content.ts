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

/** Homepage professional content: [role, organisation, date, expanded description] per entry. */
export const professionalSections = [
  {
    label: "EXPERIENCE",
    entries: [
      [
        "Fall Analyst",
        "Next Runner Capital",
        "Sep 2026 — Present",
        "Evaluating lower-middle-market acquisition opportunities through financial modeling, benchmarking, and commercial diligence.",
      ],
      [
        "Summer Associate",
        "Salus Brands, LLC",
        "Apr 2026 — Aug 2026",
        "Supported licensing, sourcing, and retail execution across North America and China.",
      ],
    ],
  },
  {
    label: "EDUCATION",
    entries: [
      [
        "Accounting",
        "Western University",
        "2025 — 2029",
        "Studying accounting with Ivey AEO.",
      ],
    ],
  },
  {
    label: "LEADERSHIP",
    entries: [
      [
        "Director, Events",
        "Western Real Estate Club",
        "Sep 2026 — Present",
        "Planning and running educational and networking events covering real estate recruiting, valuation, and industry career paths.",
      ],
      [
        "Project Lead",
        "180 Degrees Consulting",
        "Oct 2025 — Present",
        "Leading five-person consulting teams on revenue diversification and growth strategy engagements.",
      ],
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
