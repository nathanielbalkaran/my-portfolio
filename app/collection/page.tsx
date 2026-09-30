import { siteContent } from "@/data/site-content";

export default function Page() {
  return (
    <div className="home">
      <h1 className="home-role">{siteContent.common.collection}</h1>
    </div>
  );
}
