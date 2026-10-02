"use client";

import { useState } from "react";
import { professionalSections, siteContent } from "@/data/site-content";

export function HomePage() {
  // Only one row open at a time, across all sections.
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="home">
      <h1 className="sr-only">{siteContent.common.siteName}</h1>
      {professionalSections.map((section) => (
        <section
          key={section.label}
          className="home-section"
          aria-labelledby={`home-${section.label}`}
        >
          <h2 id={`home-${section.label}`} className="home-label">
            {section.label}
          </h2>
          <ul className="home-rows">
            {section.entries.map(([role, org, date, description]) => {
              const id = `${section.label}-${role}-${org}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");
              const isOpen = openId === id;
              return (
                <li
                  key={id}
                  className={`home-row${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="home-row-btn"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel`}
                    onClick={() => setOpenId(isOpen ? null : id)}
                  >
                    <span className="home-role">{role}</span>
                    <span>
                      <span className="home-org">{org}</span>
                    </span>
                    <span className="home-date">{date}</span>
                  </button>
                  <div id={`${id}-panel`} className="home-panel">
                    <div className="home-panel-clip">
                      <p className="home-desc">{description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
