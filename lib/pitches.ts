import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PITCHES_DIR = path.join(process.cwd(), "src/content/pitches");

export type PitchMeta = {
  slug: string;
  ticker: string;
  title: string;
  date: string;
};

export type Pitch = PitchMeta & {
  content: string;
};

function getSlug(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

export function getAllPitches(): PitchMeta[] {
  if (!fs.existsSync(PITCHES_DIR)) return [];
  const files = fs.readdirSync(PITCHES_DIR).filter((f) => /\.mdx?$/.test(f));
  const pitches: PitchMeta[] = files.map((filename) => {
    const fullPath = path.join(PITCHES_DIR, filename);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data } = matter(raw);
    return {
      slug: getSlug(filename),
      ticker: (data.ticker as string) ?? "",
      title: (data.title as string) ?? "",
      date: (data.date as string) ?? "",
    };
  });
  return pitches.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getPitchBySlug(slug: string): Pitch | null {
  const mdxPath = path.join(PITCHES_DIR, `${slug}.mdx`);
  const mdPath = path.join(PITCHES_DIR, `${slug}.md`);
  let fullPath: string;
  if (fs.existsSync(mdxPath)) fullPath = mdxPath;
  else if (fs.existsSync(mdPath)) fullPath = mdPath;
  else return null;
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    ticker: (data.ticker as string) ?? "",
    title: (data.title as string) ?? "",
    date: (data.date as string) ?? "",
    content,
  };
}

export function getAllSlugs(): string[] {
  return getAllPitches().map((p) => p.slug);
}
