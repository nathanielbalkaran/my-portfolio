import Link from "next/link";
import { externalLinks, siteContent } from "@/data/site-content";

export function Footer() {
  const { common, footer } = siteContent;

  return (
    <footer className="site-footer">
      <div className="site-bar">
        <Link href="/" className="link site-footer-name">
          {common.siteName}
        </Link>
        <ul className="site-footer-links">
          <li>
            <a href={externalLinks.email} className="link">
              {footer.email}
            </a>
          </li>
          <li>
            <a
              href={externalLinks.linkedIn}
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {footer.linkedin}
            </a>
          </li>
          <li>
            <a
              href={externalLinks.strava}
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {footer.strava}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
