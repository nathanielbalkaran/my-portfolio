import Link from "next/link";
import { siteContent } from "@/data/site-content";

export function LabPage() {
  return (
    <div className="home lab">
      <h1 className="home-role">{siteContent.common.lab}</h1>
      <ul className="home-rows lab-entries">
        <li>
          <Link href="/lab/orange" className="link">
            Orange
          </Link>
        </li>
        <li>
          <Link href="/lab/cycling" className="link">
            Mossbend
          </Link>
        </li>
      </ul>
    </div>
  );
}
