import { professionalSections, siteContent } from "@/data/site-content";

export function HomePage() {
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
            {section.entries.map(([role, org, date]) => (
              <li key={`${role}-${org}`} className="home-row">
                <span className="home-role">{role}</span>
                <span>{org}</span>
                <span className="home-date">{date}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
