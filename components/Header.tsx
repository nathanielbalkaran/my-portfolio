import Link from "next/link";
import { siteContent } from "@/data/site-content";

export function Header() {
  const { common } = siteContent;

  return (
    <header className="site-bar site-header">
      <Link href="/" className="link">
        {common.siteName}
      </Link>
      <nav className="site-nav" aria-label="Primary">
        <Link href="/collection" className="link">
          {common.collection}
        </Link>
        <Link href="/lab" className="link">
          {common.lab}
        </Link>
      </nav>
    </header>
  );
}
